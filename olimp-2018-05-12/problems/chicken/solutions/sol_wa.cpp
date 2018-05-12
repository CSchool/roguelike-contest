#include <iostream>
#include <string>
#include <vector>
#include <algorithm>

std::string s;

typedef std::vector<int> V;

V a, b, c;
size_t len, lena, lenb, lenc;

int parse(V &a, int i)
{
  for ( ; s[i] && s[i] != '+' && s[i] != '=' ; ++i)
    if (s[i] == '?')
      a.push_back(-1);
    else
      a.push_back(s[i] - '0');
      
  return i + 1;
}

void norm(V &a)
{
  std::reverse(a.begin(), a.end());
  a.resize(len);
  std::reverse(a.begin(), a.end());
}

void print(V &a, size_t len)
{
  for (size_t i = 0 ; i < len ; ++i)
  {
    std::cout << a[i + a.size() - len];
  }
}

void find(int i, int cc);

void two(V &a, V &b, V &c, int i, int cc)
{
    int b1 = c[i] - a[i];
    int b2 = c[i] - a[i] - 1;
    int c1 = 0, c2 = 0;
    if (b1 < 0)
    {
      c1 = 1;
      b1 += 10;
    }
    if (b2 < 0)
    {
      c2 = 1;
      b2 += 10;
    }

    if (cc == c1)
    {
      b[i] = b1;
      find(i + 1, 0);
    }
    if (cc == c2)
    {
      b[i] = b2;
      find(i + 1, 1);
    }
    
    b[i] = -1;
}

void one(V &a, V &b, V &c, int i, int cc)
{
    if (cc)
    {
      b[i] = 9 - a[i];
      c[i] = 0;
      find(i + 1, 1);
    }
    else
    {
      if (a[i] != 9)
      {
        b[i] = 0;
        c[i] = a[i] + 1;
        find(i + 1, 1);
      }
      b[i] = 0;
      c[i] = a[i];
      find(i + 1, 0);
    }

    b[i] = -1;
    c[i] = -1;
}

void find(int i, int cc)
{
  if (i == len)
  {
    if (cc == 0)
    {
      print(a, lena);
      std::cout << "+";
      print(b, lenb);
      std::cout << "=";
      print(c, lenc);
      exit(0);
    }
  }
  else if (a[i] != -1 && b[i] != -1 && c[i] != -1)
  {
    int sum1 = a[i] + b[i];
    int sum2 = a[i] + b[i] + 1;
    int c1 = sum1 / 10;
    int c2 = sum2 / 10;
    sum1 %= 10;
    sum2 %= 10;

    if (c[i] == sum1 && c1 == cc)
      find(i + 1, 0);
    else if (c[i] == sum2 && c2 == cc)
      find(i + 1, 1);
  }
  else if (a[i] != -1 && b[i] != -1)
  {
    int sum1 = a[i] + b[i];
    int sum2 = a[i] + b[i] + 1;
    int c1 = sum1 / 10;
    int c2 = sum2 / 10;
    sum1 %= 10;
    sum2 %= 10;

    if (cc == c2)
    {
      c[i] = sum2;
      find(i + 1, 1);
    }
    if (cc == c1)
    {
      c[i] = sum1;
      find(i + 1, 0);
    }
    
    c[i] = -1;
  }
  else if (a[i] != -1 && c[i] != -1)
  {
    two(a, b, c, i, cc);
  }
  else if (b[i] != -1 && c[i] != -1)
  {
    two(b, a, c, i, cc);
  }
  else if (a[i] != -1)
  {
    one(a, b, c, i, cc);
  }
  else if (b[i] != -1)
  {
    one(b, a, c, i, cc);
  }
  else if (c[i] != -1)
  {
    if (cc)
    {
      a[i] = 9;
      b[i] = c[i];
      find(i + 1, 1);
      if (c[i] != 9)
      {
        a[i] = 9;
        b[i] = 1 + c[i];
        find(i + 1, 0);
      }
    }
    else
    {
      if (c[i] != 0)
      {
        a[i] = c[i] - 1;
        b[i] = 0;
        find(i + 1, 1);
      }
      a[i] = c[i];
      b[i] = 0;
      find(i + 1, 0);
    }

    a[i] = -1;
    b[i] = -1;
  }
  else
  {
    if (cc)
    {
      a[i] = 9;
      b[i] = 1;
      c[i] = 0;
      find(i + 1, 0);
      b[i] = 0;
      find(i + 1, 1);
    }
    else
    {
      a[i] = 0;
      b[i] = 0;
      c[i] = 0;
      find(i + 1, 0);
      c[i] = 1;
      find(i + 1, 1);
    }

    a[i] = -1;
    b[i] = -1;
    c[i] = -1;
  }
}

int main()
{
  std::cin >> s;
  int i = 0;
  i = parse(a, i);
  i = parse(b, i);
  i = parse(c, i);
  lena = a.size();
  lenb = b.size();
  lenc = c.size();
  len = std::max(lena, std::max(lenb, lenc));
  norm(a);
  norm(b);
  norm(c);

  find(0, 0);
  
  std::cout << "Chicken\n";
}
