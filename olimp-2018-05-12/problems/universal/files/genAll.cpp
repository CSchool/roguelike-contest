#include "testlib.h"
#include <iostream>
#include <vector>
#include <set>
#include <algorithm>
#include <bitset>

using namespace std;

const int firstTest = 3;
const int maxN = 15;
const vector<int> exclude = {1, 8};

int main(int argc, char* argv[])
{
    registerGen(argc, argv, 1);

    vector<int> left;

    for (int i = 0; i <= maxN; ++i) {
        if (find(exclude.begin(), exclude.end(), i) == exclude.end()) {
            left.push_back(i);
        }
    }

    shuffle(left.begin(), left.end());

    for (int i = 0; i < left.size(); ++i) {
        startTest(i + firstTest);
        bitset<4> tmp(left[i]);
        cout << tmp << endl;
    }

    return 0;
}
