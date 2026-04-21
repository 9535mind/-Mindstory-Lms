/**
 * Cloudflare Pages Function — POST /api/forest-gas
 * Google Apps Script 웹앱으로 폼/JSON을 프록시합니다.
 *
 * 환경 변수(이름 정확히 일치): FOREST_GAS_WEBHOOK_URL
 * Cloudflare Dashboard → Workers & Pages → 해당 프로젝트 → Settings → Environment variables
 */

interface Env {
  FOREST_GAS_WEBHOOK_URL: string;
}

type PagesFunction<EnvType = unknown> = (context: {
  request: Request;
  env: EnvType;
  waitUntil: (p: Promise<unknown>) => void;
  passThroughOnException: () => void;
  next: () => Promise<Response>;
  data: Record<string, unknown>;
}) => Response | Promise<Response>;

function jsonResponse(data: unknown, status = 200): Response {
  const headers = new Headers({
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
  });
  return new Response(JSON.stringify(data), { status, headers });
}

function getWebhookUrl(env: Env | Record<string, unknown>): string {
  const raw = env.FOREST_GAS_WEBHOOK_URL;
  return typeof raw === 'string' ? raw.trim() : '';
}

/** 브라우저/헬스체크가 GET으로 열었을 때 500 대신 안내 */
export const onRequestGet: PagesFunction<Env> = async () => {
  return jsonResponse(
    {
      ok: true,
      method: 'GET',
      message:
        'POST 로 JSON 또는 폼 본문을 보내세요. GAS 웹앱 URL은 Worker 환경 변수 FOREST_GAS_WEBHOOK_URL 입니다.',
      path: '/api/forest-gas',
    },
    200,
  );
};

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const webhookUrl = getWebhookUrl(context.env as Env);

    if (!webhookUrl || !/^https?:\/\//i.test(webhookUrl)) {
      return jsonResponse(
        {
          success: false,
          error:
            '서버 설정 오류: FOREST_GAS_WEBHOOK_URL이 없거나 http(s) URL이 아닙니다. Cloudflare Pages 환경 변수 이름이 정확히 FOREST_GAS_WEBHOOK_URL인지, Production/Preview 모두에 값이 들어갔는지 확인하세요.',
        },
        503,
      );
    }

    let bodyBuf: ArrayBuffer;
    try {
      bodyBuf = await context.request.arrayBuffer();
    } catch (readErr) {
      return jsonResponse(
        {
          success: false,
          error: '요청 본문을 읽는 중 오류가 발생했습니다.',
          detail:
            readErr instanceof Error ? readErr.message : String(readErr),
        },
        400,
      );
    }

    const reqContentType =
      context.request.headers.get('Content-Type') || 'application/json';

    let forwardBody: BodyInit | undefined;
    if (!bodyBuf || bodyBuf.byteLength === 0) {
      forwardBody = reqContentType.includes('application/json')
        ? '{}'
        : undefined;
    } else {
      forwardBody = bodyBuf;
    }

    let gasRes: Response;
    try {
      gasRes = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': reqContentType,
          Accept: 'application/json, text/plain, */*',
        },
        ...(forwardBody !== undefined ? { body: forwardBody } : {}),
        redirect: 'follow',
      });
    } catch (fetchErr) {
      return jsonResponse(
        {
          success: false,
          error: 'Google Apps Script URL로 요청을 보내지 못했습니다.',
          detail:
            fetchErr instanceof Error ? fetchErr.message : String(fetchErr),
        },
        502,
      );
    }

    let gasText: string;
    try {
      gasText = await gasRes.text();
    } catch (textErr) {
      return jsonResponse(
        {
          success: false,
          error: 'Google Apps Script 응답 본문을 읽지 못했습니다.',
          detail:
            textErr instanceof Error ? textErr.message : String(textErr),
          gasStatus: gasRes.status,
        },
        502,
      );
    }

    if (!gasRes.ok) {
      return jsonResponse(
        {
          success: false,
          error: `Google Apps Script가 오류 응답을 반환했습니다. (HTTP ${gasRes.status})`,
          detail: gasText.slice(0, 2000),
        },
        502,
      );
    }

    const gasCt = gasRes.headers.get('Content-Type') || '';
    if (gasCt.includes('application/json')) {
      try {
        JSON.parse(gasText);
        return new Response(gasText, {
          status: 200,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Access-Control-Allow-Origin': '*',
          },
        });
      } catch {
        /* 본문이 JSON이 아니면 아래 일반 텍스트 처리 */
      }
    }

    return jsonResponse({ success: true, result: gasText }, 200);
  } catch (e) {
    return jsonResponse(
      {
        success: false,
        error: '프록시(Worker) 처리 중 예기치 않은 오류가 발생했습니다.',
        detail: e instanceof Error ? e.message : String(e),
      },
      500,
    );
  }
};

export const onRequestOptions: PagesFunction = async () => {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Max-Age': '86400',
    },
  });
};
