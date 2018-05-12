#include <bits/stdc++.h>
#include "testlib.h"

using namespace std;

string sa, so, si;

int main(int argc, char* argv[])
{
    registerTestlibCmd(argc, argv);

    si = inf.readLine();
    sa = ans.readLine();
    so = ouf.readLine();

    if (sa == "Chicken")
    {
      if (so != sa)
        quitf(_wa, "'%s' is not Chicken", so.c_str());
        
    }
    else
    {
      if (so.size() != sa.size())
        quitf(_wa, "Length of the output is incorrect\n");

      for (size_t i = 0 ; i < so.size() ; ++i)
      {
        if (si[i] != '?')
        {
          if (si[i] != so[i])
            quitf(_wa, "Invalid character at position %d\n", (int)i);
        }
        else if (so[i] < '0' || so[i] > '9')
        {
          quitf(_wa, "Invalid character at position %d\n", (int)i);
        }
      }

      int a = (int)so.find('+') - 1;
      int b = (int)so.find('=') - 1;
      int c = (int)so.size() - 1;
      int cc = 0;
      while (a >= 0 || so[b] != '+' || so[c] != '=')
      {
        int da = 0, db = 0, dc = 0;
        if (a >= 0)
        {
          da = so[a] - '0';
          --a;
        }
        if (so[b] != '+')
        {
          db = so[b] - '0';
          --b;
        }
        if (so[c] != '=')
        {
          dc = so[c] - '0';
          --c;
        }
        int sum = da + db + cc;
        cc = sum / 10;
        if (sum % 10 != dc)
          quitf(_wa, "Sum doesn't match\n");
      }
      if (cc)
        quitf(_wa, "Sum doesn't match\n");
    }

    quitf(_ok, "%s", sa);
}
