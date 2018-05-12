#include <bits/stdc++.h>

using namespace std;

int n;

bool is_adj(int a, int b) {
	if (a == 0 || b == 0) {
		return true;
	}
	int root = round(sqrt(a + b));
	return root * root == a + b;
}

vector<bool> used;
vector<int> path;

bool dfs(int x = 0) {
	if (x > 0) {
		path.push_back(x);
	}
	if (path.size() == n) {
		return true;
	}
	used[x] = 1;
	for (int i = 1; i <= n; ++i) {
		if (!used[i]) {
			if (is_adj(x, i)) {
				if (dfs(i)) {
					return true;
				}
			}
		}
	}
	used[x] = 0;
	if (x > 0) {
		path.pop_back();
	}
	return false;
}

int main() {
	cin >> n;
	used.resize(n + 1);
	if (dfs()) {
		for (int x : path) {
			cout << x << " ";
		}
		cout << endl;
	} else {
		cout << -1 << endl;
	}

}