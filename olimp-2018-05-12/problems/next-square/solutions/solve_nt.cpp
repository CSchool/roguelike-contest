// solution for next-square by Tsarev Nikita

#include <iostream>
#include <vector>
#include <cmath>

using namespace std;

typedef long long ll;

ll n;
vector<ll> path;
vector<bool> used;

bool is_perfect_square(ll x) {
    ll t = static_cast<ll>(round(sqrt(x)));
    return t * t == x;
}

void dfs(ll v) {
    path.push_back(v);
    used[v] = true;
    if (path.size() == n) {
        for (ll i : path)
            cout << i << " ";
        cout << endl;
        exit(0);
    }
    for (ll u = 1; u <= n; ++u) {
        if (used[u]) continue;
        if (!is_perfect_square(v + u)) continue;
        dfs(u);
    }
    used[v] = false;
    path.pop_back();
}

int main() {
    ios::sync_with_stdio(false);
    cin.tie(0);
    cin >> n;
    used.resize(n + 1);
    for (ll i = 1; i <= n; ++i)
        dfs(i);
    cout << -1 << endl;

    return 0;
}
