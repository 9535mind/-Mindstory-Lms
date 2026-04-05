/**
 * forest.html MS.buildInstitutionDropdownRows 와 동일한 결과를 내는 순수 함수.
 */
import type {
    ForestInstitution,
    ForestSchemaApi,
    InstitutionDropdownRow,
    SetupTypeOverride,
    TargetGroup,
} from './types';
import {
    extractChoseongSequenceFromName,
    isChoseongOnlyQueryStr,
    isPreschoolFacilityPresetName,
    normalizeChoseongQueryToCompatibilityJamo,
    normalizeForInstSearchKey,
    normalizePresetInstitutionNames,
} from './korean-inst-search';
import { guessTypeFromName, matchesInstPrepKind, matchesPresetPrepKind } from './institution-match';

/** 검색창 하단 퀵 필터 — buildInstitutionDropdownRows 최종 단계에서 적용 */
export type CategoryChipFilter = 'ALL' | 'DAYCARE' | 'KINDER' | 'ELEMENTARY_OTHER';

export interface BuildInstitutionDropdownOptions {
    schema: ForestSchemaApi;
    institutions: ForestInstitution[];
    presetDatabase: readonly string[];
    targetGroup: TargetGroup;
    setupTypeOverride: SetupTypeOverride;
    query: string;
    allMode: boolean;
    /** 기본 ALL — 초성·문자열 매칭 후 추가로 카테고리만 표시 */
    categoryChip?: CategoryChipFilter;
    /** 유아·유치부: 하드코드 타겟 명단 — 매칭 시 목록 최상단·고정 순서 */
    priorityPresetNames?: readonly string[];
}

function rowSortKey(row: InstitutionDropdownRow): string {
    if (row.kind === 'inst') return row.inst.name;
    if (row.kind === 'preset') return row.name;
    return row.query;
}

function rowMatchesCategoryChip(
    row: InstitutionDropdownRow,
    chip: CategoryChipFilter,
    schema: ForestSchemaApi
): boolean {
    if (chip === 'ALL') return true;
    if (row.kind === 'direct') return true;
    if (row.kind === 'preset') {
        const n = row.name;
        if (chip === 'ELEMENTARY_OTHER') return false;
        if (chip === 'DAYCARE') return matchesPresetPrepKind(n, '어린이집');
        if (chip === 'KINDER') return matchesPresetPrepKind(n, '유치원');
        return false;
    }
    const inst = row.inst;
    const tg = schema.getTargetGroup(inst);
    const t = String(inst.type || '').trim();
    const n = String(inst.name || '');
    if (chip === 'DAYCARE') {
        if (tg !== 'preschool') return false;
        return matchesInstPrepKind(inst, '어린이집');
    }
    if (chip === 'KINDER') {
        if (tg !== 'preschool') return false;
        return matchesInstPrepKind(inst, '유치원');
    }
    if (chip === 'ELEMENTARY_OTHER') {
        if (tg !== 'elementary') return false;
        if (['지역아동센터', '방과후교실', '초등학교', '기타'].includes(t)) return true;
        const g = guessTypeFromName(n, 'elementary');
        return g === '지역아동센터' || g === '방과후교실' || g === '초등학교' || t === '기타';
    }
    return true;
}

export function buildInstitutionDropdownRows(opts: BuildInstitutionDropdownOptions): InstitutionDropdownRow[] {
    const {
        schema,
        institutions,
        presetDatabase,
        targetGroup: tg,
        setupTypeOverride: setupOvr,
        query,
        allMode,
        categoryChip = 'ALL',
        priorityPresetNames = [],
    } = opts;

    let instList = institutions.filter((i) => schema.getTargetGroup(i) === tg);
    const presetNamesAll = normalizePresetInstitutionNames([...presetDatabase]).filter(isPreschoolFacilityPresetName);
    const nameKey = (nm: string) => normalizeForInstSearchKey(nm);
    const namesFromInst = new Set(instList.map((i) => nameKey(i.name)));

    const virtualPresets =
        tg === 'preschool' ? presetNamesAll.filter((n) => !namesFromInst.has(nameKey(n))) : [];

    const qt = query.trim();
    const ql = normalizeForInstSearchKey(qt);
    const choseongMode = isChoseongOnlyQueryStr(qt);

    const nameMatches = (nm: string) => {
        if (allMode) return true;
        if (qt.length < 1) return false;
        if (choseongMode) {
            const seq = extractChoseongSequenceFromName(nm);
            const qNorm = normalizeChoseongQueryToCompatibilityJamo(qt);
            return seq.includes(qNorm);
        }
        return nameKey(nm).includes(ql);
    };

    if (tg === 'preschool') {
        instList = instList.filter((i) => {
            const t = String(i.type || '').trim();
            const n = String(i.name || '');
            if (t === '기타' && !/(어린이집|유치원|병설)/.test(n)) return false;
            return true;
        });
    }

    instList = instList.filter((i) => nameMatches(i.name));

    let filteredVirtual = virtualPresets.filter((n) => {
        if (allMode) return true;
        if (qt.length < 1) return false;
        if (qt.length === 1) return true;
        return nameMatches(n);
    });

    /** 검색어가 있을 때는 유형 좁히기를 적용하지 않음 — 초성·부분 검색이 빈 목록으로 막히는 것 방지 */
    if (tg === 'preschool') {
        const o = setupOvr;
        const skipTypeNarrow = qt.length >= 1;
        if (!skipTypeNarrow && (o === '어린이집' || o === '유치원' || o === '기타')) {
            instList = instList.filter((i) => matchesInstPrepKind(i, o));
            filteredVirtual = filteredVirtual.filter((n) => matchesPresetPrepKind(n, o));
        }
    }

    let remainingInst = [...instList];
    let remainingVirtual = [...filteredVirtual];

    const priorityRows: InstitutionDropdownRow[] = [];
    const priorityList = tg === 'preschool' ? priorityPresetNames : [];

    for (const raw of priorityList) {
        if (!nameMatches(raw)) continue;

        const instIdx = remainingInst.findIndex((i) => nameKey(i.name) === nameKey(raw));
        let candidate: InstitutionDropdownRow;
        if (instIdx >= 0) {
            candidate = { kind: 'inst', inst: remainingInst[instIdx] };
        } else {
            candidate = { kind: 'preset', name: raw };
        }
        if (categoryChip !== 'ALL' && !rowMatchesCategoryChip(candidate, categoryChip, schema)) {
            continue;
        }

        priorityRows.push(candidate);
        if (instIdx >= 0) {
            remainingInst.splice(instIdx, 1);
        } else {
            const vi = remainingVirtual.findIndex((n) => nameKey(n) === nameKey(raw));
            if (vi >= 0) remainingVirtual.splice(vi, 1);
        }
    }

    const restRows: InstitutionDropdownRow[] = [];
    remainingInst.forEach((inst) => restRows.push({ kind: 'inst', inst }));
    remainingVirtual.forEach((name) => restRows.push({ kind: 'preset', name }));
    restRows.sort((a, b) => rowSortKey(a).localeCompare(rowSortKey(b), 'ko'));

    const rows = [...priorityRows, ...restRows];
    if (categoryChip === 'ALL') return rows;
    return rows.filter((row) => rowMatchesCategoryChip(row, categoryChip, schema));
}

export interface BuildPresetOnlyDropdownOptions {
    presetNames: readonly string[];
    targetGroup: TargetGroup;
    setupTypeOverride: SetupTypeOverride;
    query: string;
    allMode: boolean;
    categoryChip?: CategoryChipFilter;
    schema: ForestSchemaApi;
    /** true면 매칭 0일 때 direct 행 생략(2-트랙 병합 시 상위에서 처리) */
    omitDirect?: boolean;
}

/**
 * 유아·유치부: 전국 DB·대형 사전 없이 PRESET 명단만 즉시 필터(타이핑 경로).
 * 매칭 0건이면 `direct` 행으로 직접 입력 유도.
 */
export function buildPresetOnlyInstitutionDropdownRows(opts: BuildPresetOnlyDropdownOptions): InstitutionDropdownRow[] {
    const {
        presetNames,
        targetGroup: tg,
        setupTypeOverride: setupOvr,
        query,
        allMode,
        categoryChip = 'ALL',
        schema,
        omitDirect = false,
    } = opts;

    if (tg !== 'preschool') return [];

    const qt = query.trim();
    const ql = normalizeForInstSearchKey(qt);
    const choseongMode = isChoseongOnlyQueryStr(qt);
    const nameKey = (nm: string) => normalizeForInstSearchKey(nm);

    const nameMatchesPreset = (nm: string) => {
        if (allMode && qt.length < 1) return true;
        if (!allMode && qt.length < 1) return false;
        if (qt.length === 1) return true;
        if (choseongMode) {
            const seq = extractChoseongSequenceFromName(nm);
            const qNorm = normalizeChoseongQueryToCompatibilityJamo(qt);
            return seq.includes(qNorm);
        }
        return nameKey(nm).includes(ql);
    };

    let allowedSet = new Set<string>(presetNames);
    const skipTypeNarrow = qt.length >= 1;
    if (!skipTypeNarrow && (setupOvr === '어린이집' || setupOvr === '유치원' || setupOvr === '기타')) {
        allowedSet = new Set(presetNames.filter((n) => matchesPresetPrepKind(n, setupOvr)));
    }

    const out: InstitutionDropdownRow[] = [];
    for (const raw of presetNames) {
        if (!allowedSet.has(raw)) continue;
        if (!nameMatchesPreset(raw)) continue;
        const candidate: InstitutionDropdownRow = { kind: 'preset', name: raw };
        if (categoryChip !== 'ALL' && !rowMatchesCategoryChip(candidate, categoryChip, schema)) continue;
        out.push(candidate);
    }

    if (!omitDirect && out.length === 0 && qt.length >= 1) {
        out.push({ kind: 'direct', query: qt });
    }

    return out;
}

/** 프리셋 명칭 문자열 목록만 (UI에서 preset OR extended 분기용) */
export function getPresetInstitutionNamesMatching(opts: BuildPresetOnlyDropdownOptions): string[] {
    const rows = buildPresetOnlyInstitutionDropdownRows({ ...opts, omitDirect: true });
    return rows
        .filter((r): r is { kind: 'preset'; name: string } => r.kind === 'preset')
        .map((r) => r.name);
}

/**
 * 저장 기관(inst)만 검색해 최대 limit건 — buildInstitutionDropdownRows 와 동일한 매칭·칩·유형 좁히기.
 * 프리셋에 결과가 있을 때는 호출하지 않는 것을 권장(성능).
 */
export function buildPreschoolInstitutionRowsLimited(opts: {
    schema: ForestSchemaApi;
    institutions: ForestInstitution[];
    setupTypeOverride: SetupTypeOverride;
    query: string;
    categoryChip: CategoryChipFilter;
    limit: number;
    /** 이미 1차에 나온 프리셋 명칭 제외 */
    excludeNameKeys: Set<string>;
}): InstitutionDropdownRow[] {
    const full = buildInstitutionDropdownRows({
        schema: opts.schema,
        institutions: opts.institutions,
        presetDatabase: [],
        targetGroup: 'preschool',
        setupTypeOverride: opts.setupTypeOverride,
        query: opts.query,
        allMode: false,
        categoryChip: opts.categoryChip,
        priorityPresetNames: [],
    });
    const instOnly = full.filter((r): r is { kind: 'inst'; inst: ForestInstitution } => r.kind === 'inst');
    const filtered = instOnly.filter((r) => !opts.excludeNameKeys.has(normalizeForInstSearchKey(r.inst.name)));
    return filtered.slice(0, opts.limit);
}
