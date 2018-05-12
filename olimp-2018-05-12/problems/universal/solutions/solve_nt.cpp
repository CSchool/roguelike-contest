// solution for universal by Tsarev Nikita

#include <iostream>
#include <string>

using namespace std;

typedef long long ll;

int main() {
    cin.tie(0);
    ios::sync_with_stdio(false);
    string s;
    cin >> s;
    if (s == "1110" || s == "1000") {
        cout << "YES\n";
    } else {
        cout << "NO\n";
    }
    return 0;
}
