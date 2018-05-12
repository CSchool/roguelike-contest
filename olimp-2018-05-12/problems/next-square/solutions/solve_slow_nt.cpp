// slow solution for next-square by Tsarev Nikita

#include <iostream>
#include <vector>
#include <cmath>
#include <algorithm>

using namespace std;

typedef long long ll;

ll n;

bool is_perfect_square(ll x) {
    ll t = static_cast<ll>(round(sqrt(x)));
    return t * t == x;
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    cin >> n;
    vector<ll> z;
    for (ll i = 1; i <= n; ++i) {
        z.push_back(i);
    }

    do {
        bool good = true;
        for (ll i = 0; i < n - 1; ++i) {
            if (!is_perfect_square(z[i] + z[i + 1])) {
                good = false;
                break;
            }
        }
        if (good) {
            for (ll t : z) {
                cout << t << " ";
            }
            cout << endl;
            return 0;
        }
    } while (next_permutation(z.begin(), z.end()));
    cout << -1 << endl;

    return 0;
}
