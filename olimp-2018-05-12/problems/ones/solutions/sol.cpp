#include <iostream>

int main()
{
  int n, k = 0;
  std::cin >> n;
  while (n)
  {
    k += n % 2;
    n /= 2;
  }
  std::cout << k;
}
