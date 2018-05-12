#include "testlib.h"
#include <iostream>

using namespace std;

int main(int argc, char* argv[])
{
    registerGen(argc, argv, 1);

    cout << rnd.next(-atoll(argv[1]), atoll(argv[1])) << endl;

    return 0;
}
