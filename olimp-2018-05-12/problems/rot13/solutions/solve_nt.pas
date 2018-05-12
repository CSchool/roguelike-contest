program cypher;
var
    s: string;
    i: integer;
begin
    readln(s);
    for i := 1 to length(s) do begin
        write(chr(ord('a') + (ord(s[i]) - ord('a') + 13) mod 26));
    end;
    writeln;
end.
