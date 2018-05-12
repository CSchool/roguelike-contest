rem   *** validation ***
call scripts\run-validator-tests.bat
call scripts\run-checker-tests.bat

rem    *** tests ***
md tests
call scripts\gen-input-via-stdout.bat "files\genPositive.exe 100 1 group1" "tests\04" 4
call scripts\gen-input-via-stdout.bat "files\genPositive.exe 100 2 group1" "tests\05" 5
call scripts\gen-input-via-stdout.bat "files\genPositive.exe 100 3 group1" "tests\06" 6
call scripts\gen-input-via-stdout.bat "files\genAny.exe 100 1 group2" "tests\07" 7
call scripts\gen-input-via-stdout.bat "files\genAny.exe 100 2 group2" "tests\08" 8
call scripts\gen-input-via-stdout.bat "files\genAny.exe 100 3 group2" "tests\09" 9
call scripts\gen-input-via-stdout.bat "files\genPositive.exe 4294967296 1 group3" "tests\10" 10
call scripts\gen-input-via-stdout.bat "files\genPositive.exe 4294967296 2 group3" "tests\11" 11
call scripts\gen-input-via-stdout.bat "files\genPositive.exe 4294967296 3 group3" "tests\12" 12
call scripts\gen-input-via-stdout.bat "files\genAny.exe 4294967296 1 group2" "tests\13" 13
call scripts\gen-input-via-stdout.bat "files\genAny.exe 4294967296 2 group2" "tests\14" 14
call scripts\gen-input-via-stdout.bat "files\genAny.exe 4294967296 3 group2" "tests\15" 15
call scripts\gen-answer.bat tests\01 tests\01.a "tests" ""
call scripts\gen-answer.bat tests\02 tests\02.a "tests" ""
call scripts\gen-answer.bat tests\03 tests\03.a "tests" ""
call scripts\gen-answer.bat tests\04 tests\04.a "tests" ""
call scripts\gen-answer.bat tests\05 tests\05.a "tests" ""
call scripts\gen-answer.bat tests\06 tests\06.a "tests" ""
call scripts\gen-answer.bat tests\07 tests\07.a "tests" ""
call scripts\gen-answer.bat tests\08 tests\08.a "tests" ""
call scripts\gen-answer.bat tests\09 tests\09.a "tests" ""
call scripts\gen-answer.bat tests\10 tests\10.a "tests" ""
call scripts\gen-answer.bat tests\11 tests\11.a "tests" ""
call scripts\gen-answer.bat tests\12 tests\12.a "tests" ""
call scripts\gen-answer.bat tests\13 tests\13.a "tests" ""
call scripts\gen-answer.bat tests\14 tests\14.a "tests" ""
call scripts\gen-answer.bat tests\15 tests\15.a "tests" ""
call scripts\gen-answer.bat tests\16 tests\16.a "tests" ""
call scripts\gen-answer.bat tests\17 tests\17.a "tests" ""

