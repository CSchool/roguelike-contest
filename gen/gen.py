from graph import *
import random
import numpy as np
import json

level = np.zeros(shape=(130, 80))
passages = {}
has_conn = set()
doors = {}
player = dict(x=0, y=0)


delta = ((1, 0), (0, -1), (-1, 0), (0, 1))


def tocoords(c):
    x = ord(c[0]) - ord('A')
    y = int(c[1:]) - 1
    return x, y


def conn(s):
    a, b = s.split('-')
    return tocoords(a), tocoords(b)


def random_room():
    return random.randrange(CELL_WIDTH // 2, CELL_WIDTH), random.randrange(CELL_HEIGHT // 2, CELL_HEIGHT)


def rect(x):
    for i in range(x.shape[0]):
        x[i][0] = x[i][-1] = 1
    for j in range(x.shape[1]):
        x[0][j] = x[-1][j] = 1


def coord(base, d, sz):
    if d == 0:
        return base + sz // 2
    if d == -1:
        return base
    if d == 1:
        return base + sz - 1


def render_room(x, y):
    w, h = random_room()
    cx, cy = round((x + 0.5) * CELL_WIDTH), round((y + 0.5) * CELL_HEIGHT)
    if (x, y) == tocoords(START):
        player['x'] = cx
        player['y'] = cy
    cx -= w // 2
    cy -= h // 2
    rect(level[cx:cx + w, cy:cy + h])
    for d in delta:
        if ((x, y), (x + d[0], y + d[1])) in has_conn:
            tx = coord(cx, d[0], w)
            ty = coord(cy, d[1], h)
            level[tx,ty] = 2
            passages[((x, y), (x + d[0], y + d[1]))] = (tx, ty)


def write():
    s = ""
    for j in range(level.shape[1]):
        for i in range(level.shape[0]):
            c = " "
            if level[i][j] == 1:
                c = "#"
            if level[i][j] == 2:
                c = "D"
            s += c
        s += "\n"
    with open("map.txt", "w") as f:
        f.write(s)
    meta = dict(
            id=2,
            dur=5 * 60 * 60,
            width=level.shape[0],
            height=level.shape[1],
            doors=doors,
            player=player
            )
    with open("meta.json", "w") as f:
        json.dump(meta, f, indent=4, sort_keys=True)


rooms = set()

for s in CONNECTIONS:
    a, b = conn(s[0])
    has_conn.add((a, b))
    has_conn.add((b, a))

for s in CONNECTIONS:
    a, b = conn(s[0])
    rooms.add(a)
    rooms.add(b)

for r in rooms:
    render_room(*r)

for s in CONNECTIONS:
    a, b = conn(s[0])
    i = passages[(a, b)]
    j = passages[(b, a)]
    if s[1] is not None:
        doors["%d,%d" % (i[0], i[1])] = s[1]
    w = 1
    if i[0] == j[0]:
        if i[1] > j[1]:
            i, j = j, i
        x = i[0]
        for y in range(i[1] + 1, j[1]):
            level[x-w,y] = level[x+w,y] = 1
    if i[1] == j[1]:
        if i[0] > j[0]:
            i, j = j, i
        y = i[1]
        for x in range(i[0] + 1, j[0]):
            level[x,y-w] = level[x,y+w] = 1


write()
