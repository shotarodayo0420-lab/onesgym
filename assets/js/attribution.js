/* ONE'S GYM 流入元の記録（2026-10-13）
 * GBP投稿などに付けたUTM（utm_source / utm_medium / utm_campaign / utm_content）を、着地したページと一緒に
 * この端末のブラウザ（localStorage）にだけ保存する。予約フォームの送信時に「流入元」として一緒に送る（reserve.html）。
 * 外部への送信・Cookie・解析タグは無し。UTMの無いアクセスでは何もしない（直近のUTMを30日間保持）。
 * ルールと集計: projects/ones-gym/measurement/README.md */
(function () {
  var KEY = 'onesgym_attr', DAYS = 30;
  var ok = function (v) { return typeof v === 'string' && /^[A-Za-z0-9._\-\/]{1,80}$/.test(v) ? v : ''; };
  try {
    var p = new URLSearchParams(location.search);
    var s = ok(p.get('utm_source') || '');
    if (s) {
      localStorage.setItem(KEY, JSON.stringify({
        s: s, m: ok(p.get('utm_medium') || ''), c: ok(p.get('utm_campaign') || ''),
        ct: ok(p.get('utm_content') || ''), l: ok(location.pathname), t: Date.now()
      }));
    }
  } catch (e) {}
  window.onesgymAttr = function () {
    try {
      var a = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (!a || !a.t || Date.now() - a.t > DAYS * 86400000) return null;
      return { s: a.s, m: a.m, c: a.c, ct: a.ct, l: a.l };
    } catch (e) { return null; }
  };
})();
