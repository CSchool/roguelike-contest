// solution for overflow by Tsarev Nikita

#include <iostream>

using namespace std;

typedef unsigned long long ull;
typedef long long ll;

int main() {
    cin.tie(0);
    ios::sync_with_stdio(false);
    ll N;
    cin >> N;


    if (N == 0) {
        cout << 1 << endl;
        return 0;
    }

    bool negative = false;
    ull n;
    if (N < 0) {
        negative = true;
        n = -N;
    } else {
        n = N;
    }
    ull s;

    if (n & 1) {
        s = ((n + 1) / 2) * n;
    } else {
        s = (n / 2) * (n + 1);
    }

    if (negative) {
        s--;
        if (s > 0) {
            cout << '-';
        }
    }

    cout << s << endl;

    return 0;
}