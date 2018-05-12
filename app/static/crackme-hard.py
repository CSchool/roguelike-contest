import sys

def fail():
    print("wrong password")
    sys.exit()

def ok():
    print("ok")
    sys.exit()


u = "SalPvMoe"
h = [83, 60, 80, 38, 128, 147, 107, 59, 219, 244, 83, 288, 313]
s = input("password: ")

if len(s) < 8 or len(s) > 32:
    fail()

for c in s:
    if c not in u:
        fail()

if ord(s[2]) - ord(s[0]) != 25:
    fail()

if ord(s[3]) - ord(s[4]) != 17:
    fail()

if ord(s[1]) * ord(s[3]) != 13098:
    fail()

x = 0
y = 0
z = 0xFFFFFFFF

a = []

for c in s:
    x += ord(c) >> 2
    y ^= ord(c)
    z ^= ord(c)
    if z < 0x80000000:
        a.append(x)
    else:
        a.append(y)
    for _ in range(8):
        mask = -(z & 1)
        z = (z >> 1) ^ (0xEDB88320 & mask)

z ^= 0xFFFFFFFF

if z != 0x8466c02c:
    fail()

if a != h:
    fail()

ok()
