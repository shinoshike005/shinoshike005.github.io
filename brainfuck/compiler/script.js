$("#run").on("click",()=>{
    $("#output").val(
        compile(
            $("#code").val(),
            {}
        )
    );
});
$("#code").on("input",()=>{
    localStorage.setItem("brainfuck_compiler_code",$("#code").val());
});

if(localStorage.getItem("brainfuck_compiler_code") != null)
    $("#code").val(localStorage.getItem("brainfuck_compiler_code"));



function compile(codes="",option={}){

    function s(string=">",ct=1){
        // return string.repeat(ct);

        if(string == ">" || string == "<" || ct < 20) return string.repeat(ct);
        let res = "";

        let n = 10;
        if(ct > 20000) n = 1000;
        else if(ct > 200) n = 100;

        let before = point;

        res += "<".repeat(before);
        res += "+".repeat(Math.floor(ct/n));
        res += "[-";
        res += ">".repeat(before);
        res += string.repeat(n);
        res += "<".repeat(before);
        res += "]";
        res += ">".repeat(before);
        res += string.repeat(ct % n);

        return res;
    }


    codes = codes.split("\n").filter(Boolean);

    let response = ">";
    let point = 1;
    let memory = [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0];

    let def = {};

    function Number(e){
        if(def[e] != undefined) return def[e];
        return parseInt(e);
    }


    for (let i = 0; i < codes.length; i++) {
        // console.log(memory);
        // console.log(point);

        const code = codes[i];
        const m = code.split(" ");
        if(m[0] == "goto"){
            if(m[1] == "+"){
                response += s(">",Number(m[2]));
            }else if(m[1] == "-"){
                response += s("<",Number(m[2]));
            }else{
                const to = Number(m[1]);
                if(to == 0) continue;
                if(point == to) continue;
                else if(point > to){
                    // response += "(goto "+to+")";
                    response += s("<",point-to)
                    point = to;
                }else if(point < to){
                    // response += "(goto "+to+")";
                    response += s(">",to-point);
                    point = to;
                }
            }
        }else if(m[0] == "string"){
            const memorydata = memory[point];

            let target;
            if(m[1] == "" && m[2] != undefined){
                target = " ";
            }else if(m[1] == "var" && m[2] != undefined){
                target = Number(m[2]).toString();
            }else{
                target = m[1];
            }

            const charCode = target.charCodeAt(0);
            if(charCode == memorydata) continue;
            else if(memorydata > charCode){
                // response += "(string "+m[1][0]+")"
                response += s("-",memorydata-charCode);
                memory[point] = charCode;
            }else if(charCode > memorydata){
                // response += "(string "+m[1][0]+")"
                response += s("+",charCode-memorydata);
                memory[point] = charCode;
            }
        }else if(m[0] == "print"){
            response += ".";
        }else if(m[0] == "change"){
            const now = memory[point];
            const to = Number(m[2]);
            if(m[1] == "="){
                if(to == now) continue;
                else if(now > to){
                    response += s("-",now-to);
                    memory[point] = to;
                }else if(to > now){
                    response += s("+",to-now);
                    memory[point] = to;
                }
            }else if(m[1] == "+"){
                response += s("+",to);
                memory[point] += to;
            }else if(m[1] == "-"){
                response += s("-",to);
                memory[point] -= to;
            }
        }else if(m[0] == "["){
            response += "[";
        }else if(m[0] == "]"){
            response += "]";
        }else if(m[0] == "prints"){
            m.splice(0,1);
            let tmp = "";

            const n = m.join(" ").split("");
            for (let i = 0; i < n.length; i++) {
                const s = n[i];
                tmp += ("string "+s+"\n");
                tmp += ("print");
                if(i != n.length-1) tmp += "\n";
            }
            const mmm = "<"+compile(tmp);
            response += mmm;
        }else if(m[0] == "def"){
            def[m[1]] = parseInt(m[2]);
        }else if(m[0] == "input"){
            response += ",";
            memory[point] = m[1].charCodeAt(0);
        }
    }

    response = minify(response);

    return response;
}

function minify(r=""){
    return r.replace(/></g,"").replace(/<>/g,"");
}
