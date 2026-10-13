/* ONE'S GYM アクセス解析（GA4・2026-10-13 オーナー決定。正本 projects/ones-gym/measurement/README.md）
 * 計測するもの: ページの閲覧（page_view）・体験予約ボタンのクリック（reserve_click）・LINEボタンのクリック（line_click）・
 *   電話のクリック（tel_click）・予約フォームの送信成功（reserve_submit_success。reserve.html から呼ぶ）
 * 個人情報は送らない: 送るURLは UTM 以外のクエリと #以降を取り除く。フォームの入力値は一切送らない（種別・メニューの区分だけ）。
 *   広告向けの機能（Googleシグナル・広告のパーソナライズ）はオフ。
 * テストの除外: localStorage に onesgym_internal=1 がある端末と、テスト送信（お名前・本文に「テスト」）は traffic_type=internal を付け、
 *   送信成功は別名（reserve_submit_test）にする。GA4 の「内部トラフィック」データフィルタで除外する。 */
(function () {
  var ID = 'G-6G3372MZ8X';
  if (location.hostname !== 'onesgym.jp' && !/[?&]ga_debug=1/.test(location.search)) return; // 本番以外では送らない
  var internal = false;
  try { internal = localStorage.getItem('onesgym_internal') === '1'; } catch (e) {}
  var KEEP = /^utm_(source|medium|campaign|content|term)$/;
  function cleanUrl(u) {
    try {
      var x = new URL(u, location.href), q = new URLSearchParams();
      x.searchParams.forEach(function (v, k) { if (KEEP.test(k)) q.set(k, v); });
      var s = q.toString();
      return x.origin + x.pathname + (s ? '?' + s : '');
    } catch (e) { return location.origin + location.pathname; }
  }
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  window.gtag = window.gtag || gtag;
  var base = { page_location: cleanUrl(location.href), page_referrer: document.referrer ? cleanUrl(document.referrer) : '',
    allow_google_signals: false, allow_ad_personalization_signals: false };
  if (internal) base.traffic_type = 'internal';
  gtag('js', new Date());
  gtag('config', ID, base);
  var s = document.createElement('script');
  s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + ID;
  document.head.appendChild(s);

  function area(el) {
    var sec = el.closest('header,nav,footer,.mobile-menu,.hero,section,[id]');
    if (!sec) return 'body';
    return (sec.id || sec.tagName.toLowerCase()).slice(0, 40);
  }
  window.onesgymTrack = function (name, params) {
    var p = params || {};
    if (internal) p.traffic_type = 'internal';
    if (p.traffic_type === undefined) delete p.traffic_type;
    p.page_path = location.pathname;
    gtag('event', name, p);
  };
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href]');
    if (!a) return;
    var h = a.getAttribute('href') || '';
    var label = (a.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (/reserve\.html/.test(h)) window.onesgymTrack('reserve_click', { link_text: label, link_area: area(a) });
    else if (/lin\.ee|line\.me/.test(h)) window.onesgymTrack('line_click', { link_text: label, link_area: area(a) });
    else if (/^tel:/.test(h)) window.onesgymTrack('tel_click', { link_area: area(a) });
  }, true);
})();
