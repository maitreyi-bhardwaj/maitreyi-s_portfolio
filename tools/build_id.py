"""Builds the six industrial design case studies from one shared template.
Images are pages of the industrial design portfolio PDF (rendered at 2000px)
copied into media/id/<project>/pNNN.jpg. Run from the site folder."""
import os, shutil, subprocess, html, time, sys

SRC = sys.argv[1] if len(sys.argv) > 1 else ''
V = str(int(time.time()))
e = html.escape

def img(proj, n):
    rel = f'media/id/{proj}/{n}.jpg' if isinstance(n, str) else f'media/id/{proj}/p{n:03d}.jpg'
    if SRC and not os.path.exists(rel):
        os.makedirs(os.path.dirname(rel), exist_ok=True)
        subprocess.run(['sips', '-s', 'formatOptions', '78', f'{SRC}/p{n:03d}.jpg', '--out', rel], capture_output=True)
    return rel

def row(proj, items, caption=None):
    figs = ''.join(f'<figure><a href="{img(proj, n)}" target="_blank" rel="noopener"><img src="{img(proj, n)}" alt="{e(alt)}" loading="lazy"></a></figure>' for n, alt in items)
    cap = f'<figcaption>{e(caption)}</figcaption>' if caption else ''
    return f'  <div class="idp-row r{len(items)}">{figs}</div>{cap}\n'

def stats(items):
    return f'  <div class="idp-stats" style="--n:{len(items)}">' + ''.join(f'<div><b>{e(a)}</b><span>{e(b)}</span></div>' for a, b in items) + '</div>\n'

def quote(text, who):
    return f'  <blockquote class="idp-quote"><p>{e(text)}</p><cite>{e(who)}</cite></blockquote>\n'

def chapter(i, title, paras, *blocks):
    body = ''.join(f'<p>{p}</p>' for p in paras)
    return (f'<section class="idp-chapter">\n  <div class="idp-text"><div><p class="idp-num">{i:02d}</p><h2>{e(title)}</h2></div>'
            f'<div class="idp-body">{body}</div></div>\n' + ''.join(blocks) + '</section>\n')

def page(slug, p):
    facts = ''.join(f'<div><dt>{e(k)}</dt><dd>{e(v)}</dd></div>' for k, v in p['facts'])
    chapters = ''.join(chapter(i + 1, *c) for i, c in enumerate(p['chapters']))
    awards = ''
    if p.get('awards'):
        awards = ('<section class="idp-chapter">\n  <div class="idp-text"><div><p class="idp-num">Recognition</p><h2>What it earned</h2></div><div></div></div>\n'
                  '  <div class="idp-awards">' + ''.join(f'<div><b>{e(a)}</b><span>{e(b)}</span></div>' for a, b in p['awards']) + '</div>\n'
                  + (row(slug, p['award_imgs']) if p.get('award_imgs') else '') + '</section>\n')
    li = lambda xs: ''.join(f'<li>{e(x)}</li>' for x in xs)
    learn = (f'<section class="idp-chapter"><div class="idp-learn"><div><h3>What I learned</h3><ul>{li(p["learned"])}</ul></div>'
             f'<div><h3>How I\'ll use it next</h3><ul>{li(p["next_use"])}</ul></div></div></section>\n')
    nxt_slug, nxt_name = p['next']
    hero_n, hero_alt = p['hero']
    out = f'''<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>{e(p["name"])}, Maitreyi Bhardwaj</title>
<meta name="description" content="{e(p["desc"])}">
<link rel="icon" type="image/svg+xml" href="favicon.svg">
<link rel="stylesheet" href="site.css?v={V}">
<link rel="stylesheet" href="id.css?v={V}">
</head>
<body class="idp">

<div data-topbar></div>

<div class="idp-hero"><img src="{img(slug, hero_n)}" alt="{e(hero_alt)}"></div>

<header class="idp-head">
  <h1 class="idp-title">{e(p["name"])}</h1>
  <p class="idp-lede">{p["lede"]}<span>{e(p["sub"])}</span></p>
</header>
<dl class="idp-facts">{facts}</dl>

{chapters}{awards}{learn}
<nav class="idp-next"><span>{e(p["footnote"])}</span><a href="{nxt_slug}.html"><b>{e(nxt_name)}</b>Next project</a></nav>

<div data-foot></div>
<script src="site.js?v={V}"></script>
</body>
</html>
'''
    open(f'{slug}.html', 'w').write(out)

P = {}
P['epipals'] = dict(
  name='Epi Pals', next=('khai', 'KHAI'), hero=(110, 'A boy on a playground wearing the purple Epi Pals watch'),
  desc='A wearable that helps children with epilepsy feel confident and independent while reassuring their parents.',
  lede='A wearable for children with epilepsy. <b>It helps them feel confident and independent, and gives their parents quiet reassurance.</b>',
  sub='Confidence to keep playing.',
  facts=[('Year', 'Fall 2025'), ('Course', 'IND 460, with Dosun Shin'), ('Role', 'Industrial Designer, solo'), ('Type', 'Wearable, product and service')],
  chapters=[
    ('Millions of children live with epilepsy', [
      'In 2021, an estimated <b>18.15 million children and adolescents worldwide were living with epilepsy.</b>',
      'Three things came up again and again: children feel restricted, parents constantly worry, and there is no support after a seizure.'],
      stats([('18.15M', 'children and adolescents living with epilepsy worldwide, 2021'), ('3', 'recurring problems: children feel restricted, parents worry, no support after seizures')]),
      row('epipals', [(89, 'A child holding his head in distress'), (90, 'Children feel restricted, parents worry, no support after seizures'), (94, 'A family drawing together at a table')])),
    ('“I stopped wearing my medical alert bracelet”', [
      'I interviewed Cherly, a young adult whose seizures began at age 10. She cannot drive or be alone, and takes daily medication.',
      '<b>Medical devices felt annoying and embarrassing to her.</b> She wanted epilepsy not to define her identity: to feel normal, blend in, and still be safe.'],
      quote('I stopped wearing my medical alert bracelet because it got annoying.', 'Cherly, young adult and student, York, PA'),
      row('epipals', [(91, 'Interview findings: Cherly’s bio, goals, frustrations and motivations'), (92, 'Current solutions: detection, monitoring, data for caregivers'), (95, 'Stakeholder map: parents, other kids, teacher')])),
    ('Beyond detection', [
      'Existing products detect seizures, monitor signals and show data to caregivers. None of them help the child feel good wearing one.',
      '<b>How might we help kids with epilepsy feel confident and independent, while reassuring parents?</b>'],
      row('epipals', [(93, 'The design question'), (96, 'Early watch sketches'), (97, 'Character and form sketches')])),
    ('Friendly, not medical', [
      'The direction was silicone, soft and playful: <b>fun, cool and friendly, never medical looking.</b>',
      'I explored a family of colourways and a small character face so each child can choose one that feels like theirs.'],
      row('epipals', [(98, 'Moodboard: silicone, fun, cool, friendly, not medical looking'), (99, 'Variations in pink, peach and lilac'), (107, 'Colour, material and finish: four watches in a row')])),
    ('Support that stays quiet', [
      'Five layers sit inside: interface, processing, connectivity and location, haptic feedback and sensing.',
      '<b>A gentle 1, 2, 3 vibration guides breathing</b> when a child feels confused or overwhelmed. It needs no conscious interaction and stays private.',
      'Live location reassures parents without constant check-in texts, so they can trust without hovering.'],
      row('epipals', [(102, 'Exploded view of the five internal layers'), (103, 'Haptic breathing support on the blue watch'), (106, 'Location reassurance on the lilac watch')]),
      row('epipals', [(104, 'A gentle 1, 2 and 3 vibration pattern'), (109, 'Storyboard: alert before a seizure, find a safe spot, haptic help after')])),
    ('Something familiar to hold onto', [
      '<b>There is nothing to tap, just something familiar to hold onto.</b> The watch alerts before a seizure, the child finds a safe spot, and haptics help them afterwards.'],
      row('epipals', [(100, 'A child at play wearing the watch'), (108, 'A hand resting on the purple watch'), (105, 'Blue and lilac watches on display')])),
  ],
  learned=['Talking to one real person changed the brief more than any market data.', 'For children, how a device feels to wear matters as much as what it does.', 'Haptics can comfort without words or screens.'],
  next_use=['Interview the people who will live with a product before sketching.', 'Design medical and assistive products to be wanted, not just tolerated.'],
  footnote='Demo video: youtu.be/AhrnrndWxrQ')

P['khai'] = dict(
  name='KHAI', next=('strata', 'Strata'), hero=(86, 'The KHAI interior from above: caramel leather seats and a retro wheel'),
  desc='KHAI, a car concept made for women working in the city: drive into your future.',
  lede='A car concept for women in the prime of their careers. <b>Made for the city: it drives itself through traffic so the cabin can become an office, a lounge or a place to rest.</b>',
  sub='Drive into your future.',
  facts=[('Year', 'Spring 2025'), ('Team', 'Maitreyi, Sarai, Sofia'), ('Role', 'Industrial Designer'), ('Type', 'Automotive interior and exterior')],
  chapters=[
    ('Who it is for', [
      'Women around 30, at the height of their careers, with high disposable income and a busy schedule in a big city.',
      '<b>They want convenience, luxury and self-expression</b>, and they are tired of bumpy roads, parking and living on the freeway.'],
      row('khai', [(72, 'User profile'), (73, 'Made for the city: needs and performance'), (74, 'Moodboard with a caramel and cream palette')])),
    ('Made for the city', [
      'Noise cancellation for a quiet cabin, self-driving for parking, lane changes and traffic, and suspension that adjusts for bumpy roads.',
      '<b>AI remembers your favourite settings</b>, from temperature to seat position.'],
      stats([('400+ mi', 'on one charge'), ('0–60', 'mph in 4 seconds'), ('80%', 'charge in 20 to 30 minutes')])),
    ('The name', [
      '<b>KHAI conveys sophistication, strength and innovation.</b> The material breakdown pairs the exterior body with warm leather and soft textiles inside.'],
      row('khai', [(76, 'KHAI wordmark beside a cream car nose'), (75, 'Material breakdown: exterior and interior'), (71, 'KHAI title with a woman stepping into the car')])),
    ('Sketching inside and out', [
      'Seats rotate and lean back, and retractable desks fold out for the front and back seats.',
      '<b>Day mode</b> simplifies traffic routes and saves energy with solar charging. <b>Night mode</b> brings automatic headlights and optional LED ambience.',
      'A modular desk clips to the underside of the steering wheel and detaches when it isn’t needed.'],
      row('khai', [(77, 'Exterior sketches'), (78, 'Interior sketches: rotating seats and retractable desks'), (79, 'Day mode and night mode interior sketches')]),
      row('khai', [(83, 'Dashboard sketch: retro wheel and smart screen'), (84, 'Rendered interior sketch'), (80, 'Interior concept sketches with seat studies')])),
    ('The interior', [
      '<b>A warm, retro-modern cabin</b>: caramel leather, cream panels and a classic wheel with a smart screen beside it.'],
      row('khai', [(85, 'Interior from the back seat'), (87, 'Side view of the front seats')])),
  ],
  awards=[('Design Excellence Award', 'Franznick Family Scholarship, The Design School, ASU, May 2025')],
  award_imgs=[(70, 'Design Excellence Award, Franznick Family Scholarship')],
  learned=['Designing a vehicle starts with a day in someone’s life, not with the car.', 'Working as a team of three, a shared moodboard kept every decision consistent.'],
  next_use=['Build a clear user day before designing any space people spend hours in.', 'Agree on a material palette early in team projects.'],
  footnote='Team project with Sarai and Sofia.')

P['strata'] = dict(
  name='Strata', next=('kith', 'Kith'), hero=(52, 'The Strata mat in close-up, grey with sculpted black zones'),
  desc='Strata, the thinking mat: a floor mat that reads your body and adjusts so you can rest.',
  lede='The thinking mat. <b>You lie down, it reads your body, and four zones adjust under your head, neck, upper back and lower back so you can actually rest.</b>',
  sub='A surface that works while you rest.',
  facts=[('Year', '2026'), ('Context', 'Solo concept'), ('Role', 'Industrial Designer'), ('Size', '1800 × 700 × 30 mm')],
  chapters=[
    ('People don’t get time to rest', [
      'Screen days keep getting longer, and <b>no product has been designed to give the body the recovery time it no longer gets.</b>',
      'I designed for Priya, 31, a remote knowledge worker who works ten hours a day from her apartment floor, with chronic lower back and neck pain and no ergonomic setup.'],
      stats([('73%', 'of workers report not having enough time to rest daily (WHO 2023, as cited in my research)'), ('11 hrs', 'average screen and work time per day for knowledge workers by 2040'), ('Zero', 'products designed to give the body the recovery time it no longer gets')])),
    ('From sticky notes to clay', [
      'I started wide with sticky notes, then shaped <b>ridges and valleys by hand in clay</b>, drawing small figures on the models to see how a body would rest on each one.',
      'Then I layered memory foam and wool felt to feel how soft and firm should meet.'],
      row('strata', [(31, 'Sticky-note ideation'), (32, 'Clay models with small figures resting on them'), (33, 'Clay model: ridges and valleys')]),
      row('strata', [(34, 'Layering with memory foam and wool felt'), (35, 'Pencil sketches of the mat'), (36, 'Three early 3D surface studies')])),
    ('Four zones, four shapes', [
      '<b>Each zone answers one place where screen posture blocks recovery.</b> A round dome offloads the head, a saddle channel keeps the neck’s curve, bilateral ridges support the upper back so the spine never touches, and a raised dome fills the gap under the lower back.'],
      row('strata', [(40, 'Why these four zones'), (39, 'The body-shaped layout in CAD'), (37, 'Render of the zoned surface')])),
    ('The technology already exists', [
      'Luxury car seats have used inflating lumbar bladders since 2003. <b>Strata takes that idea, makes it automatic, full-body and floor-based.</b>',
      'Twelve pressure zones read the body every 200 ms, a smartwatch adds heart-rate variability, and an ESP32 decides each zone’s firmness. A dial lets you override it.'],
      row('strata', [(41, 'The technology already exists, in your car seat'), (44, 'Reads, decides, responds'), (43, 'Lie down, mat reads, you recover')])),
    ('Six layers, every one already exists', [
      'A knit skin, a 3D-printed TPU lattice that is dense under ridges and open under valleys, EVA foam inserts, a printed sensor grid, the microcontroller and a silicone base.',
      '<b>Manufacturing $84–120 a unit, retail $299–349</b>: the price of a massage gun, less than a chair.'],
      row('strata', [(38, 'Exploded layers'), (45, 'Memory foam and wool felt samples'), (46, 'Six layers, every one already exists')])),
    ('A surface that works while you rest', [
      'It lies on the floor like a rug, in three colourways, and asks nothing of you but to lie down.'],
      row('strata', [(42, 'A person resting on the mat in a room'), (49, 'The mat in a sunlit attic room'), (50, 'The mat seen across the room')]),
      row('strata', [(47, 'Three colourways standing'), (48, 'Three colourways laid flat'), (51, 'Top view of the cream colourway')])),
  ],
  learned=['A form has to be justified part by part, not as one shape.', 'Using processes that already exist makes a concept believable.', 'Physical and digital design meet in products like this.'],
  next_use=['Cite and test every claim before presenting it.', 'Build and try one zone physically before claiming it works.'],
  footnote='Concept; not yet built or tested.')

P['kith'] = dict(
  name='Kith', next=('pitboss', 'Pit Boss'), hero=(67, 'Two lit Kith lamp shades, close up'),
  desc='Kith, a 3D-printed pendant lamp for your chosen family, with shades shaped after shared fruits.',
  lede='A pendant lamp for the dining table. <b>For your chosen family: each shade is shaped after a fruit that a community gathers and shares.</b>',
  sub='Meals with meaning.',
  facts=[('Year', '2025'), ('Context', 'ASU studio project'), ('Role', 'Industrial Designer, solo'), ('Process', 'Sketching, Rhino, Grasshopper, 3D printing, wiring')],
  chapters=[
    ('Meals with meaning', [
      'I started with the shared meal: <b>the table where the people you choose gather.</b>',
      'The cacao ceremony became a key reference: a ritual where cacao is shared to open the heart and offer a moment of reflection, out of respect for the land, the plant and the community.'],
      row('kith', [(53, 'A family laughing around a dining table'), (56, 'A community at a cacao ceremony'), (57, 'Shared foods moodboard')])),
    ('Six fruits, six communities', [
      'Quandong from the central deserts of Australia, hala pandanus from the Pacific Islands, rambutan from Southeast Asia, baobab from Africa, cacao pod from Mesoamerica and paw paw from the eastern United States.',
      '<b>Each fruit has a strong form of its own. Those forms became the shades.</b>'],
      row('kith', [(59, 'Research notes and the six fruits'), (58, 'Reference lamps and hanging mobiles'), (60, 'Sketches of the hanging structure')])),
    ('Sketching', [
      'Pages of forms before it narrowed to a lamp: <b>a cluster of shades hanging from one stem, like fruit on a branch.</b>'],
      row('kith', [(54, 'A page of early sketches'), (55, 'Lamp form sketches')])),
    ('Modelling and printing', [
      'I modelled the shades in Rhino and Grasshopper and printed them, testing how each surface holds light.',
      '<b>A pattern that looks right on screen glows very differently with a bulb behind it.</b>'],
      row('kith', [(61, 'Shade modelled with a Grasshopper definition'), (62, 'Printed shades, unlit and lit'), (64, 'Prints and the printer')])),
    ('Made by hand', [
      '<b>I prepared the copper arms, did the electric wiring and assembled the lamp myself.</b>'],
      row('kith', [(63, 'Copper arms and printed shades'), (65, 'Preparing copper, electric wiring, assembling')]),
      row('kith', [('bench-lit', 'The finished lamp lit on the workbench among wires and tools')])),
    ('For your chosen family', [
      'The shades hang together from one stem, each a different fruit, all lit at once.'],
      row('kith', [('full-lamp', 'The whole lamp hanging and lit against a red wall')]),
      row('kith', [('white-close', 'Close view of the lit shades'), ('warm-close', 'The shades glowing warm yellow'), ('from-below', 'Looking up at the lamp on its curved black arms')]),
      row('kith', [(69, 'The lamp lit over a table')])),
  ],
  learned=['Light changes a form more than any render predicts.', 'A failed print teaches more about a shape than a model on screen.'],
  next_use=['Prototype early in the real material.', 'Judge a design in the conditions it will be used in.'],
  footnote='Sketched, modelled, printed, wired and assembled by hand.')

P['pitboss'] = dict(
  name='Pit Boss', next=('lex', 'LEX'), hero=(14, 'Render of the full Pit Boss in-store display'),
  desc='An in-store display for Pit Boss grills, designed for Dansons in a sponsored ASU studio.',
  lede='An in-store display for Pit Boss grills, for Dansons. <b>It turns a grill sitting on a shop floor into a place that explains what the grill does.</b>',
  sub='It’s not just a grill. It’s Pit Boss.',
  facts=[('Year', 'Fall 2024'), ('Client', 'Dansons × ASU'), ('Role', 'Industrial Design student'), ('Process', 'Field research, sketching, cardboard, rendering')],
  chapters=[
    ('What I saw in the store', [
      'At Lowe’s, <b>the Pit Boss grill sat on the floor and taught customers nothing.</b> The help button called a worker who took a while to arrive.',
      'The section was pushed to the back of the store by the bathroom, under dark lighting.'],
      row('pitboss', [(5, 'Lowe’s observations'), (3, 'Store visits and a boxed grill'), (4, 'Calls with the Dansons team')])),
    ('Four ideas', [
      'Boss Ball, an expandable box. Grills on the Wheels, packaging with pull-down wheels. Mini Boss, a cardboard grill for kids made from the packaging. Boss Grip, a removable carry grip.',
      '<b>The biggest gap wasn’t the box. It was the moment in the store when nobody explains the grill.</b>'],
      row('pitboss', [(7, 'Four concept sketches')])),
    ('Planning the display', [
      'I drew the layout, then built it small in cardboard to check heights, sight lines and where a shopper would stand.',
      '<b>The graphics say one thing clearly: five ways to cook in one grill.</b>'],
      row('pitboss', [(6, 'Layout drawings'), (8, 'Cardboard mock-ups'), (9, 'The 5 in 1 graphics and blue pattern')])),
    ('The scale model', [
      'Walking around a model showed what a drawing hides: which panel blocks which, and what you see first from the aisle.'],
      row('pitboss', [(10, 'Scale model, front'), (11, 'Scale model, side'), (13, 'Scale model with pellet shelf')])),
    ('The final display', [
      '<b>The grill stands in the middle with the story of what it does around it</b>, and the accessories within reach.'],
      row('pitboss', [(2, 'Display render with the grill in front'), (15, 'Display from the other side'), (16, 'Close render of the grill')])),
  ],
  awards=[('Design Excellence Award', 'Fall 2024, The Design School, ASU'), ('Dansons competition', 'Project presented to the Dansons team')],
  award_imgs=[(17, 'Presentation day'), (18, 'Design Excellence Award certificate, Fall 2024'), (19, 'Final render with the Dansons competition ribbon')],
  learned=['Going to the store shows things a brief never mentions.', 'A cardboard model answers questions a render can’t.'],
  next_use=['Start by watching the real setting first.', 'Treat the first screen of an app the way I treated this display.'],
  footnote='Sponsored studio with Dansons, maker of Pit Boss.')

P['lex'] = dict(
  name='LEX', next=('epipals', 'Epi Pals'), hero=(20, 'Render of the LEX jogging stroller'),
  desc='LEX, a soft good product: a quilted textile system for an urban jogging stroller.',
  lede='A soft good product. <b>A quilted textile canopy and seat for an urban jogging stroller, made to keep up with parents who run, walk and explore the city.</b>',
  sub='Soft goods for the Thule Urban Glide.',
  facts=[('Year', 'Spring 2025'), ('Context', 'Soft goods studio, ASU'), ('Role', 'Industrial Designer, solo'), ('Process', 'Moodboard, sketching, CAD, rendering')],
  chapters=[
    ('For parents on the move', [
      'The audience is <b>urban parents and caregivers who lead active lives</b> and need a versatile, high-quality stroller that keeps up with their daily routine: jogging, walking and exploring the city with their child.'],
      row('lex', [(24, 'A parent with a child in a stroller'), (22, 'Moodboard: stroller, textiles, frame')])),
    ('Sketching the frame and fabric', [
      'I sketched the frame, canopy and basket together, so <b>the fabric follows the structure</b> instead of covering it.'],
      row('lex', [(23, 'Pages of stroller sketches')])),
    ('Modelling and rendering', [
      'The frame was modelled first, then the soft parts: <b>a quilted canopy, seat and basket in a geometric weave.</b>'],
      row('lex', [(25, 'CAD models of the frame and seat'), (26, 'Rendered canopy and seat close-ups'), (27, 'Four colourways')])),
  ],
  learned=['Soft goods have to be designed around the hard structure they sit on.', 'A colourway range shows a product can be a family, not a one-off.'],
  next_use=['Sketch structure and surface together from the start.', 'Plan colour and material options as part of the design, not after it.'],
  footnote='Soft good product.')

for slug, p in P.items():
    page(slug, p)
print('built', ', '.join(P))
