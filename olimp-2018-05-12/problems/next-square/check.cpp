#include "testlib.h"
#include <sstream>
#include <set>

using namespace std;

bool is_perfect_square(int x) {
    int t = static_cast<int>(round(sqrt(x)));
    return t * t == x;
}

int main(int argc, char * argv[])
{
    registerTestlibCmd(argc, argv);
    int n = inf.readInt();
    vector<int> oseq;
    while (!ouf.seekEof()) {
        oseq.push_back(ouf.readInt());
    }

    bool outOk = true;
    if (oseq.size() == 1 && oseq[0] == -1)
        outOk = false;

    if (outOk) {
        if (oseq.size() != n) {
            quitf(_wa, "expected %d numbers, found %d", n, oseq.size());
        }

        set<int> z;

        for (int t : oseq) {
            if (t < 1 || t > n) {
                quitf(_wa, "%d is not in range [1, %d]", t, n);
            }

            if (z.find(t) != z.end()) {
                quitf(_wa, "duplicate element %d", t);
            }

            z.insert(t);
        }
        
        for (int i = 0; i < oseq.size() - 1; ++i) {
            if (!is_perfect_square(oseq[i] + oseq[i + 1])) {
                quitf(_wa, "sequence is not valid");
            }
        }
    }

    bool ansOk = (ans.readInt() != -1);

    if (ansOk && !outOk) {
        quitf(_wa, "valid answer not found");
    }

    if (!ansOk && outOk) {
        quitf(_fail, "answer exists, although jury didn't find it");
    }

    if (ansOk && outOk) {
        quitf(_ok, "%d numbers", n);
    }

    if (!ansOk && !outOk) {
        quitf(_ok, "answer doesn't exist");
    }

    return 0;
}
