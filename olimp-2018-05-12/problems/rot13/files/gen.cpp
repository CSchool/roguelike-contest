#include "testlib.h"
#include <iostream>

using namespace std;

int main(int argc, char* argv[])
{
    registerGen(argc, argv, 1);

    cout << rnd.next("[a-z]{1,100}") << endl;

    return 0;
}
