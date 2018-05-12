// solution for abs-difference by Tsarev Nikita

#include <iostream>

using namespace std;

typedef long long ll;

int main() {
    cin.tie(0);
    ios::sync_with_stdio(false);
    ll a, b;
    cin >> a >> b;
    ll d = a - b;
    if (d < 0) d = -d;
    cout << d << endl;
    return 0;
}
