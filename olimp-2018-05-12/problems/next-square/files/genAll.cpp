#include "testlib.h"
#include <iostream>
#include <vector>
#include <set>
#include <algorithm>

using namespace std;

const int firstTest = 4;
const int maxN = 42;
const vector<int> exclude = {1, 5, 15};

int main(int argc, char* argv[])
{
    registerGen(argc, argv, 1);

    vector<int> left;

    for (int i = 1; i <= maxN; ++i) {
        if (find(exclude.begin(), exclude.end(), i) == exclude.end()) {
            left.push_back(i);
        }
    }

    shuffle(left.begin(), left.end());

    for (int i = 0; i < left.size(); ++i) {
        startTest(i + firstTest);
        cout << left[i] << endl;
    }

    return 0;
}
