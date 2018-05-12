#include <iostream>
#include <string>
#include <stdlib.h>

const char code[9] = "\x13\xe\x1e\x3\x1e\x3\x17\x16";

void fail()
{
  std::cout << "Access denied\n";
  exit(1);
}

int main()
{
  std::string s;
  std::cout << "Enter password: ";
  std::cin >> s;

  if (s.size() != 8)
    fail();

  for (size_t i = 0 ; i != s.size() ; ++i)
    s[i] ^= code[i];

  if (s != "password")
    fail();

  std::cout << "Access granted\n";
}
