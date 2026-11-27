#!/usr/bin/env python3
"""Builds seeon.io/experience/ (EN) and /de/experience/ (DE). Engine: experience/game.js, texts: experience/data.{lang}.js."""
import os
SITE = '/home/claude/seeon-placeholder'
BOOK = 'https://calendar.app.google/QthHi7N7QSBMn5Ym6'
S = {
 'en': dict(path='/experience/', home='/', locale='en_GB', privacy='/privacy/#en',
   title='Experience SEEON | Find the three',
   desc='An illustrative simulation: twenty professionals around you at a trade fair, in a lounge, a hotel lobby or a train. Three of them matter. Find them.',
   ogt='Experience SEEON: twenty people around you, three of them matter',
   sim='Illustrative simulation. Not the live product. All people and stories are fictional.',
   scenes='Scenes', you='You', offer='Offer', look='Looking for', profile='Your profile',
   found='Found', of3='of 3', heard='Stories heard', time='Time', tod='Time of day',
   reveal='Show me with SEEON', close='Close', closeStory='Close story', personal='Personal', business='Business',
   talk='Talk to them', walk='Walk on', book='Book a 15-minute call →', again='Play this scene again', topbook='Book a call →',
   lead='Point at someone to see a short hint about what they do. Open their story to hear the personal and the business side. When you think someone is the right person, walk over and talk to them. Find all three.',
   back='seeon.io', cookies='Cookie settings', priv='Privacy', imp='Imprint',
   alt='Top-down view of a trade fair hall with twenty people. Three of them matter.'),
 'de': dict(path='/de/experience/', home='/de/', locale='de_DE', privacy='/privacy/#de',
   title='SEEON erleben | Finden Sie die drei',
   desc='Eine anschauliche Simulation: zwanzig Menschen um Sie herum, auf einer Messe, in einer Lounge, einer Hotellobby oder im Zug. Drei davon zählen. Finden Sie sie.',
   ogt='SEEON erleben: zwanzig Menschen um Sie herum, drei davon zählen',
   sim='Anschauliche Simulation. Nicht das fertige Produkt. Alle Personen und Geschichten sind erfunden.',
   scenes='Szenen', you='Sie', offer='Angebot', look='Gesucht', profile='Ihr Profil',
   found='Gefunden', of3='von 3', heard='Geschichten gehört', time='Zeit', tod='Tageszeit',
   reveal='Mit SEEON zeigen', close='Schließen', closeStory='Geschichte schließen', personal='Persönlich', business='Beruflich',
   talk='Ansprechen', walk='Weitergehen', book='15-Minuten-Call buchen →', again='Diese Szene noch einmal', topbook='Call buchen →',
   lead='Zeigen Sie auf eine Person, um kurz zu sehen, was sie macht. Öffnen Sie ihre Geschichte, um die persönliche und die berufliche Seite zu hören. Wenn Sie glauben, die richtige Person gefunden zu haben, gehen Sie hin und sprechen Sie sie an. Finden Sie alle drei.',
   back='seeon.io', cookies='Cookie-Einstellungen', priv='Datenschutz', imp='Impressum',
   alt='Messehalle von oben mit zwanzig Menschen. Drei davon zählen.'),
}
CSS = open(os.path.join(os.path.dirname(os.path.abspath(__file__)), 'experience.css')).read()

def page(lang):
    t = S[lang]; url = 'https://seeon.io' + t['path']
    alts = ''.join(f'<link rel="alternate" hreflang="{l}" href="https://seeon.io{S[l]["path"]}">' for l in S) + \
        f'<link rel="alternate" hreflang="x-default" href="https://seeon.io{S["en"]["path"]}">'
    sw = ' · '.join((f'<a href="{S[l]["path"]}" hreflang="{l}" lang="{l}"' + (' aria-current="true"' if l == lang else '') + f'>{l.upper()}</a>') for l in S)
    img = 'https://seeon.io/experience/og-experience.jpg'
    return f'''<!DOCTYPE html>
<html lang="{lang}">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
<title>{t['title']}</title>
<meta name="description" content="{t['desc']}">
<link rel="canonical" href="{url}">
{alts}
<meta property="og:type" content="website"><meta property="og:site_name" content="SEEON">
<meta property="og:title" content="{t['ogt']}"><meta property="og:description" content="{t['desc']}">
<meta property="og:url" content="{url}"><meta property="og:locale" content="{t['locale']}">
<meta property="og:image" content="{img}"><meta property="og:image:width" content="1200"><meta property="og:image:height" content="627">
<meta property="og:image:alt" content="{t['alt']}">
<meta name="twitter:card" content="summary_large_image"><meta name="twitter:image" content="{img}">
<meta name="robots" content="index, follow">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Poppins:wght@700&display=swap">
<style>{CSS}</style>
<script src="/consent.js?v=4" defer></script>
</head>
<body>
<div class="wrap">
  <header>
    <a class="mark" href="{t['home']}">SEEON</a>
    <div class="top"><span class="langs">{sw}</span><a class="topbook" href="{BOOK}" target="_blank" rel="noopener" data-book>{t['topbook']}</a></div>
  </header>
  <p class="sim">{t['sim']}</p>
  <nav class="tabs" role="tablist" aria-label="{t['scenes']}" id="tabs"></nav>
  <p class="where" id="where"></p>
  <h1 id="title"></h1>
  <p class="lead">{t['lead']}</p>
  <div class="you" aria-label="{t['profile']}">
    <b>{t['you']}</b><span id="youWho"></span>
    <b>{t['offer']}</b><span id="youOffer"></span>
    <b>{t['look']}</b><span id="youLook"></span>
  </div>
  <div class="hud" aria-live="polite">
    <span>{t['found']} <strong id="found">0</strong> {t['of3']}</span>
    <span>{t['heard']} <strong id="heard">0</strong></span>
    <span>{t['time']} <strong id="time">0:00</strong></span>
    <span class="toggle" id="timeToggle" hidden role="group" aria-label="{t['tod']}">
      <button type="button" data-v="morning" aria-pressed="true">08:10</button>
      <button type="button" data-v="evening" aria-pressed="false">19:20</button>
    </span>
    <span class="spacer"></span>
    <button class="btn tint" id="revealBtn" type="button">{t['reveal']}</button>
  </div>
  <div class="stage" id="stage">
    <svg class="hall" id="hall" aria-hidden="true"></svg>
    <button class="backdrop" id="backdrop" type="button" hidden aria-label="{t['closeStory']}" tabindex="-1"></button>
    <div class="sheet" id="sheet" hidden role="dialog" aria-modal="false" aria-labelledby="sName">
      <button class="close" id="closeSheet" type="button" aria-label="{t['close']}">×</button>
      <div><h2 id="sName"></h2><p class="role" id="sRole"></p></div>
      <div class="story"><p class="tag">{t['personal']}</p><p id="sPersonal"></p></div>
      <div class="story"><p class="tag">{t['business']}</p><p id="sBusiness"></p></div>
      <div class="verdict" id="sVerdict" hidden></div>
      <div class="actions" id="sActions">
        <button class="btn" id="talkBtn" type="button">{t['talk']}</button>
        <button class="btn ghost" id="walkBtn" type="button">{t['walk']}</button>
      </div>
    </div>
  </div>
  <section class="reveal" id="reveal" hidden aria-live="polite">
    <h2 id="rTitle"></h2>
    <p class="stats" id="rStats"></p>
    <h3 id="rHead"></h3>
    <div class="matches" id="matches"></div>
    <p class="note" id="rNote"></p>
    <div class="row">
      <a class="btn" href="{BOOK}" target="_blank" rel="noopener" data-book>{t['book']}</a>
      <button class="btn ghost" id="againBtn" type="button">{t['again']}</button>
    </div>
  </section>
  <footer>
    <span>© SEEON</span>
    <a href="{t['home']}">seeon.io</a>
    <a href="{t['privacy']}">{t['priv']}</a>
    <a href="{'/faq/' if lang=='en' else '/de/faq/'}">FAQ</a>
    <a href="{t['home']}#impressum">{t['imp']}</a>
    <button type="button" class="consent-link" data-consent-open>{t['cookies']}</button>
  </footer>
</div>
<script src="/experience/data.{lang}.js?v=1"></script>
<script src="/experience/game.js?v=1"></script>
</body>
</html>
'''

for lang in S:
    d = os.path.join(SITE, S[lang]['path'].strip('/'))
    os.makedirs(d, exist_ok=True)
    open(os.path.join(d, 'index.html'), 'w', encoding='utf-8').write(page(lang))
    print('wrote', d)
