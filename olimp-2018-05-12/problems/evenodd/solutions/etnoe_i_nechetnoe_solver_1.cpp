#include<iostream>
#include<string>
#include<cstdio>
using namespace std;

int main()
{
    string expr;
    string x, y;
    cin >> expr;
    cin >> x;
    cin >> y;
    for (int i = 0; i < (int)expr.size(); i++)
    {
        if (expr[i] == 'x')
            expr[i] = (x == "Odd") + '0';
        if (expr[i] == 'y')
            expr[i] = (y == "Odd") + '0';
    }
    bool is_odd = false;
    for (int i = 0; i < (int)expr.size(); i++)
    {
        int a = 0;
        while (i < (int)expr.size() && expr[i] >= '0' && expr[i] <= '9')
            a = expr[i] - '0', i++;
        bool cur_odd = a % 2;
        while (i < (int)expr.size() && expr[i] == '*')
        {
            i++;
            int a = 0;
            while (i < (int)expr.size() && expr[i] >= '0' && expr[i] <= '9')
                a = expr[i] - '0', i++;
            cur_odd *= a % 2;
        } 
        is_odd ^= cur_odd;
    }
    if (is_odd)
        cout << "Odd\n";
    else
        cout << "Even\n";
    return 0;
}