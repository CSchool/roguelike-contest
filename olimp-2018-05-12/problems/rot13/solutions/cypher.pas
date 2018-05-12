program cypher_two;
var s:string;
i:integer;
begin
readln(s);
for i:=1 to length(s) do
write(chr(97+(ord(s[i])-84)mod 26));
end.
