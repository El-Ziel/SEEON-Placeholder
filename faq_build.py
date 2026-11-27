#!/usr/bin/env python3
"""Builds seeon.io/faq/ (EN) and /de/faq/ (DE) from faq_content.py."""
import os, re, json, html
from faq_content import FAQ
SITE='/home/claude/seeon-placeholder'
BOOK='https://calendar.app.google/QthHi7N7QSBMn5Ym6'
S={'en':dict(path='/faq/',home='/',locale='en_GB',privacy='/privacy/#en',title='FAQ | SEEON',h1='Frequently asked questions',
  lead='What SEEON is, what it is not, and what happens to your data.',desc='Questions and answers about SEEON: how it works on business trips and at events, who can see you, and what happens to your data.',
  more='Your question is not here?',book='Book a 15-minute call →',topbook='Book a call →',priv='Privacy',imp='Imprint',cookies='Cookie settings',exp='Try it yourself →'),
 'de':dict(path='/de/faq/',home='/de/',locale='de_DE',privacy='/privacy/#de',title='Häufige Fragen | SEEON',h1='Häufige Fragen',
  lead='Was SEEON ist, was es nicht ist und was mit Ihren Daten passiert.',desc='Fragen und Antworten zu SEEON: wie es auf Geschäftsreisen und Veranstaltungen funktioniert, wer Sie sieht und was mit Ihren Daten passiert.',
  more='Ihre Frage ist nicht dabei?',book='15-Minuten-Call buchen →',topbook='Call buchen →',priv='Datenschutz',imp='Impressum',cookies='Cookie-Einstellungen',exp='Selbst ausprobieren →')}
CSS='''
:root{--ink:#111317;--muted:#5d636d;--line:rgba(17,19,23,.12);--tint:#405e8d;--soft:rgba(64,94,141,.07)}
*{box-sizing:border-box}
body{margin:0;background:#fff;color:var(--ink);font:16px/1.65 -apple-system,BlinkMacSystemFont,"Segoe UI",Inter,Helvetica,Arial,sans-serif}
.wrap{max-width:760px;margin:0 auto;padding:40px 20px 72px}
.top{display:flex;justify-content:space-between;align-items:center;gap:14px;flex-wrap:wrap;margin-bottom:40px}
.logo{font-weight:800;letter-spacing:.18em;color:var(--ink);text-decoration:none}
.right{display:flex;align-items:center;gap:14px}
.langs{font-size:14px;color:var(--muted)}.langs a{color:var(--muted);text-decoration:none;font-weight:600}.langs a[aria-current]{color:var(--tint)}
.topbook{font-size:14px;font-weight:600;color:var(--tint);text-decoration:none;border:1px solid rgba(64,94,141,.38);background:var(--soft);border-radius:4px;padding:7px 12px}
h1{font-size:clamp(1.9rem,5vw,2.5rem);line-height:1.15;margin:0 0 10px;text-wrap:balance}
.lead{color:var(--muted);margin:0 0 20px}
h2{font-size:.8rem;letter-spacing:.09em;text-transform:uppercase;color:var(--tint);margin:40px 0 4px}
details{border-bottom:1px solid var(--line)}
summary{cursor:pointer;list-style:none;padding:16px 36px 16px 0;font-weight:650;position:relative}
summary::-webkit-details-marker{display:none}
summary::after{content:"+";position:absolute;right:4px;top:12px;font-size:1.4rem;font-weight:400;color:var(--muted)}
details[open] summary::after{content:"\\2212"}
details p{margin:0 0 18px;color:#222;max-width:64ch}
a{color:var(--tint)}
.cta{margin-top:44px;padding:24px;border:1px solid var(--line);border-radius:8px;background:var(--soft);display:flex;gap:12px;flex-wrap:wrap;align-items:center;justify-content:space-between}
.cta p{margin:0;font-weight:650}
.cta .row{display:flex;gap:10px;flex-wrap:wrap}
.btn{display:inline-block;padding:11px 18px;border-radius:4px;background:var(--ink);color:#fff;text-decoration:none;font-weight:600;border:1px solid var(--ink)}
.btn.sec{background:transparent;color:var(--ink);border-color:var(--line)}
footer{border-top:1px solid var(--line);margin-top:56px;padding-top:18px;color:var(--muted);font-size:.9rem;display:flex;gap:18px;flex-wrap:wrap}
footer a{color:var(--muted)}
.consent-link{background:none;border:0;padding:0;font:inherit;color:inherit;text-decoration:underline;cursor:pointer}
h1,h2,p,summary{hyphens:manual}
'''
def strip(t): return re.sub(r'<[^>]+>','',t)
def page(lang):
    t=S[lang]; url='https://seeon.io'+t['path']
    alts=''.join(f'<link rel="alternate" hreflang="{l}" href="https://seeon.io{S[l]["path"]}">' for l in S)+f'<link rel="alternate" hreflang="x-default" href="https://seeon.io/faq/">'
    sw=' · '.join(f'<a href="{S[l]["path"]}" hreflang="{l}" lang="{l}"'+(' aria-current="true"' if l==lang else '')+f'>{l.upper()}</a>' for l in S)
    body=''; ld=[]
    for g,qs in FAQ[lang]:
        body+=f'<h2>{g}</h2>\n'
        for q,a in qs:
            body+=f'<details><summary>{q}</summary><p>{a}</p></details>\n'
            ld.append({"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":strip(a)}})
    jsonld=json.dumps({"@context":"https://schema.org","@type":"FAQPage","inLanguage":lang,"mainEntity":ld},ensure_ascii=False)
    exp='/experience/' if lang=='en' else '/de/experience/'
    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{t['title']}</title>
<meta name="description" content="{html.escape(t['desc'])}">
<link rel="canonical" href="{url}">
{alts}
<meta property="og:type" content="website"><meta property="og:site_name" content="SEEON"><meta property="og:title" content="{t['title']}">
<meta property="og:description" content="{html.escape(t['desc'])}"><meta property="og:url" content="{url}"><meta property="og:locale" content="{t['locale']}">
<meta property="og:image" content="https://seeon.io/og-image.jpg"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="627">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="https://seeon.io/og-image.jpg">
<meta name="robots" content="index, follow">
<style>{CSS}</style>
<script type="application/ld+json">{jsonld}</script>
<script src="/consent.js?v=4" defer></script>
</head>
<body>
<div class="wrap">
<div class="top"><a class="logo" href="{t['home']}">SEEON</a><div class="right"><span class="langs">{sw}</span><a class="topbook" href="{BOOK}" target="_blank" rel="noopener">{t['topbook']}</a></div></div>
<h1>{t['h1']}</h1>
<p class="lead">{t['lead']}</p>
{body}<div class="cta"><p>{t['more']}</p><div class="row"><a class="btn" href="{BOOK}" target="_blank" rel="noopener">{t['book']}</a><a class="btn sec" href="{exp}">{t['exp']}</a></div></div>
<footer><span>© SEEON</span><a href="{t['home']}">seeon.io</a><a href="{t['privacy']}">{t['priv']}</a><a href="{t['home']}#impressum">{t['imp']}</a><button type="button" class="consent-link" data-consent-open>{t['cookies']}</button></footer>
</div>
</body>
</html>
'''
for lang in S:
    d=os.path.join(SITE,S[lang]['path'].strip('/')); os.makedirs(d,exist_ok=True)
    open(os.path.join(d,'index.html'),'w',encoding='utf-8').write(page(lang)); print('wrote',d)
