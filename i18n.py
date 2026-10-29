#!/usr/bin/env python3
"""Extract translatable blocks from SEEON pages and render translated copies."""
import json, re, sys, os, copy
from bs4 import BeautifulSoup, NavigableString, Comment, Tag

SITE = '/home/claude/seeon-placeholder'
PAGES = {'home': 'index.html', 'traveljourney': 'traveljourney/index.html',
         'tradefairs': 'tradefairs/index.html', 'businesstravel': 'businesstravel/index.html'}
INLINE = {'a','strong','em','b','i','span','br','code','small','sup','sub','abbr','u'}
SKIP = {'script','style','svg','noscript','head','canvas'}
ATTRS = ['alt','aria-label','title','placeholder']

def norm(s): return re.sub(r'\s+', ' ', s).strip()

def has_text(el): return bool(norm(el.get_text()))

def is_inline_only(el):
    for d in el.descendants:
        if isinstance(d, Tag) and d.name not in INLINE: return False
    return True

def blocks(root):
    out = []
    def walk(el):
        for c in el.children:
            if not isinstance(c, Tag) or c.name in SKIP: continue
            if c.has_attr('data-noi18n'): continue
            if not has_text(c): continue
            if is_inline_only(c):
                direct_txt = ''.join(t for t in c.children if isinstance(t, NavigableString) and not isinstance(t, Comment))
                kids = [k for k in c.children if isinstance(k, Tag)]
                if not norm(direct_txt) and len(kids) >= 2 and all(k.name in ('a','span','button') for k in kids):
                    walk(c); continue
                out.append(c)
            else:
                # loose text directly inside a non-inline container
                for t in c.children:
                    if isinstance(t, NavigableString) and not isinstance(t, Comment) and norm(t) and t.parent.name not in SKIP:
                        out.append(t)
                walk(c)
    walk(root)
    return out

def key_of(b):
    if isinstance(b, NavigableString): return norm(str(b))
    return norm(b.decode_contents())

def load(page):
    return BeautifulSoup(open(os.path.join(SITE, PAGES[page]), encoding='utf-8').read(), 'html.parser')

def extract(page):
    s = load(page); keys = []
    def add(k):
        if k and k not in keys and re.search(r'[A-Za-z]', k): keys.append(k)
    if s.title: add(norm(s.title.string or ''))
    for m in s.find_all('meta'):
        if m.get('name') in ('description',) or m.get('property') in ('og:title','og:description'):
            add(norm(m.get('content','')))
    for b in blocks(s.body): add(key_of(b))
    for el in s.body.find_all(True):
        if el.name in SKIP: continue
        for a in ATTRS:
            if el.has_attr(a): add(norm(el[a]))
    return keys

if __name__ == '__main__':
    cmd = sys.argv[1]
    if cmd == 'extract':
        for p in PAGES:
            ks = extract(p)
            json.dump(ks, open(f'src/{p}.en.json','w'), ensure_ascii=False, indent=1)
            print(p, len(ks), sum(len(k.split()) for k in ks), 'words')

LANGS = ['en','de','fr','es','pt','it']
NAMES = {'en':'English','de':'Deutsch','fr':'Français','es':'Español','pt':'Português','it':'Italiano'}
PATHS = {'home':'', 'traveljourney':'traveljourney/', 'tradefairs':'tradefairs/', 'businesstravel':'businesstravel/'}
MENU_LABEL = {'en':'Language','de':'Sprache','fr':'Langue','es':'Idioma','pt':'Idioma','it':'Lingua'}

def url(lang, page):
    return '/' + ('' if lang == 'en' else lang + '/') + PATHS[page]

MENU_CSS = '''
.lang-menu{position:relative;display:inline-block;font-size:.9rem;font-weight:600}
.lang-menu summary{list-style:none;cursor:pointer;display:inline-flex;align-items:center;gap:6px;min-height:34px;padding:0 10px;border:1px solid rgba(17,17,17,.16);border-radius:4px;background:rgba(255,255,255,.92);color:#111;user-select:none}
.lang-menu summary::-webkit-details-marker{display:none}
.lang-menu summary::after{content:"";width:6px;height:6px;border-right:1.5px solid currentColor;border-bottom:1.5px solid currentColor;transform:rotate(45deg) translateY(-2px)}
.lang-menu[open] summary::after{transform:rotate(-135deg) translateY(-1px)}
.lang-menu ul{position:absolute;right:0;top:calc(100% + 6px);z-index:50;margin:0;padding:6px;list-style:none;min-width:150px;background:#fff;border:1px solid rgba(17,17,17,.12);border-radius:6px;box-shadow:0 12px 32px rgba(17,17,17,.12)}
.lang-menu li a{display:block;padding:8px 10px;border-radius:4px;color:#333;text-decoration:none;border:0}
.lang-menu li a:hover{background:#f4f5f8;color:#111}
.lang-menu li a[aria-current]{color:#405e8d;font-weight:700}
@media (max-width:900px){.nav .lang-menu ul{left:0;right:auto}}
h1,h2,h3,p,li,a,strong,span{hyphens:manual;-webkit-hyphens:manual}
h1,h2,h3{text-wrap:balance}
.hero > .wrap,.hero-copy,.privacy-points li,.cta > div,.differentiator > *{min-width:0}
@media (max-width:640px){.privacy-points{grid-template-columns:minmax(0,1fr)!important}.button{white-space:normal;text-align:center;line-height:1.3;padding-top:10px;padding-bottom:10px}}
'''

def menu_html(lang, page):
    items = ''.join(
        f'<li><a href="{url(l,page)}" hreflang="{l}" lang="{l}"' + (' aria-current="true"' if l == lang else '') + f'>{NAMES[l]}</a></li>'
        for l in LANGS)
    return (f'<details class="lang-menu" data-noi18n><summary aria-label="{MENU_LABEL[lang]}">{lang.upper()}</summary>'
            f'<ul>{items}</ul></details>')

def add_chrome(s, lang, page):
    """language menu, hreflang links, css. Idempotent."""
    for el in s.select('details.lang-menu'): el.decompose()
    for el in s.select('link[rel="alternate"][hreflang]'): el.decompose()
    for el in s.select('style#lang-menu-css'): el.decompose()
    css = MENU_CSS
    if page == 'traveljourney' and lang != 'en':
        css += '@media (max-width:640px){.hero h1{font-size:clamp(2.6rem,14vw,4.6rem);max-width:none}}\n'
    st = s.new_tag('style', id='lang-menu-css'); st.string = css; s.head.append(st)
    for l in LANGS + ['x-default']:
        ln = s.new_tag('link', rel='alternate', hreflang=l, href='https://seeon.io' + url('en' if l == 'x-default' else l, page))
        s.head.append(ln)
    menu = BeautifulSoup(menu_html(lang, page), 'html.parser')
    if page == 'home':
        sw = s.select_one('.lang-switcher')
        for b in sw.select('.lang-btn'): b.decompose()
        for sp in sw.find_all('span', recursive=False): sp.decompose()
        sw.append(menu)
    else:
        s.select_one('header.topbar nav.nav').append(menu)

def localize_links(s, lang, page):
    for el in s.find_all(['a','img','source','link','script']):
        for attr in ('href','src'):
            v = el.get(attr)
            if not v: continue
            if attr == 'href' and el.name == 'a':
                if lang != 'en':
                    if v == '/': el[attr] = f'/{lang}/'
                    for p in ('traveljourney','tradefairs','businesstravel'):
                        if v.rstrip('/') == '/' + p: el[attr] = f'/{lang}/{p}/'
                    if v.startswith('/privacy/'): el[attr] = '/privacy/#' + ('de' if lang == 'de' else 'en')
            if lang != 'en' and not re.match(r'^(/|https?:|#|mailto:|tel:|data:)', v):
                el[attr] = '/' + PATHS[page] + v

def render(page, lang, tr):
    s = load(page)
    keys = extract(page) if False else None
    en_keys = json.load(open(f'src/{page}.en.json'))
    idx = {k: i for i, k in enumerate(en_keys)}
    def T(k):
        i = idx.get(k)
        if i is None: return None
        return tr.get(str(i))
    if lang != 'en':
        if s.title and T(norm(s.title.string or '')): s.title.string = T(norm(s.title.string))
        for m in s.find_all('meta'):
            if m.get('name') == 'description' or m.get('property') in ('og:title','og:description'):
                t = T(norm(m.get('content',''))); 
                if t: m['content'] = t
        for b in blocks(s.body):
            t = T(key_of(b))
            if t is None: continue
            if isinstance(b, NavigableString):
                raw = str(b); lead = raw[:len(raw)-len(raw.lstrip())]; trail = raw[len(raw.rstrip()):]
                b.replace_with(lead + t + trail)
            else:
                b.clear()
                frag = BeautifulSoup(t, 'html.parser')
                for c in list(frag.contents): b.append(c)
        for el in s.body.find_all(True):
            if el.name in SKIP: continue
            for a in ATTRS:
                if el.has_attr(a):
                    t = T(norm(el[a]))
                    if t: el[a] = t
        s.html['lang'] = lang
        localize_links(s, lang, page)
    add_chrome(s, lang, page)
    html = str(s)
    if page == 'home' and lang != 'en':
        inject = ("let currentLang = 'en';\n    translations['%s'] = Object.assign({}, translations.en, %s);\n    currentLang = '%s';"
                  % (lang, json.dumps({'toastSignal': tr.get('toastSignal',''), 'toastCloser': tr.get('toastCloser','')}, ensure_ascii=False), lang))
        assert "let currentLang = 'en';" in html
        html = html.replace("let currentLang = 'en';", inject, 1)
    return html

def build(langs):
    for page in PAGES:
        for lang in langs:
            tr = {} if lang == 'en' else json.load(open(f'tr/{page}.{lang}.json'))
            out = render(page, lang, tr)
            dest = os.path.join(SITE, PAGES[page] if lang == 'en' else f'{lang}/{PAGES[page]}')
            os.makedirs(os.path.dirname(dest) or '.', exist_ok=True)
            open(dest, 'w', encoding='utf-8').write(out)
            # report untranslated
            if lang != 'en':
                en_keys = json.load(open(f'src/{page}.en.json'))
                miss = [i for i,k in enumerate(en_keys) if str(i) not in tr]
                print(page, lang, 'untranslated idx:', miss)

if __name__ == '__main__' and sys.argv[1] == 'build':
    build(sys.argv[2].split(','))
