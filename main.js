document.getElementById('markdownInput').addEventListener("change",function(e){
    var mdfile = e.target.files[0];
    if(!mdfile) return;
    var reader = new FileReader();
    reader.readAsText(mdfile);
    reader.onload = function() {
        file_content = this.result;
        // escape characters
        file_content = file_content.replace(/&/g,'\\&')
            .replace(/%/g,'\\%')
            .replace(/~/g,'\~')
            .replace(/\r\n/g,'\n');         // Adapte CRLF
        file_content = file_content
            // ##### boldface with a space
            .replace(/\#\#\#\#\# (.+)/g,"\\par\\framebreak\n\\textbf{$1} ")
            // #### new frame
            .replace(/\#\#\#\# (.+)/g,"\n\\end{frame}\n\\begin{frame}[allowframebreaks]\n\\frametitle{$1}")
            // ### subsection 
            .replace(/\#\#\# (.+)/g,"\\end{frame}\n\\subsection{$1}\n\\begin{frame}[allowframebreaks]\n\\frametitle{$1}")
            // ## section 
            .replace(/\#\# (.+)/g, "\\end{frame}\n\\section{$1}\n\\begin{frame}[allowframebreaks]")
            // # title
            .replace(/\# (.+)/g, "\\documentclass[UTF8]{ctexbeamer}\n\\usepackage{ctex}\n\\usetheme{CambridgeUS}\n\\usefonttheme{professionalfonts}\n\\setbeamertemplate\{frametitle continuation\}\[from second\]\[(\\uppercase\\expandafter{\\romannumeral\\insertcontinuationcount\})\]\n\\def\\link#1#2{\\href{#1}{\\color{blue} #2}}\n\\usepackage{listings}\n\\usepackage{underscore}\n\\setlength{\\parskip}{0.5em}\n\\setlength{\\parindent}{2em}\% You can comment this if no indent is needed.\n\\begin{document}\n\\title{$1}\n\\maketitle\n\\begin{frame}\n\\frametitle{提纲}\n\\tableofcontents\n\\end{frame}\n\\AtBeginSubsection\[\]\{\n\\begin{frame}\n\\frametitle{提纲\}\n\\tableofcontents[currentsection,currentsubsection]\n\\end{frame}\n\}\n\\begin{frame}[allowframebreaks]");
        file_content = file_content
            // boldface syntax
            .replace(/\*\*([^\*]*)\*\*/g,"\\textbf\{$1\}") 
            // italc syntax 
            .replace(/\*([^\*]+)\*/g,"\\emph{$1}")  
            // delete line 
            .replace(/\~\~(.*?)\~\~/g,"\\sout{$1}"); 
        file_content = file_content
            // figure syntax 
            .replace(/\!\[(.*?)\]\((.*?)\)/g,"\\begin\{figure\}\n\\centering\n\\includegraphics[height=0.5\\textheight]\{$2\}\n\\caption\{$1\}\n\\end\{figure\}")
            // link syntax
            .replace(/\[(.*?)\]\((.*?)\)/g,"\\link\{$2\}\{$1\}"); 
        // blocks
        // TODO: multiple layers
        var block_searching = function(reg,id,replacer,begenv,endenv){
            while((bitems = reg.exec(file_content))!=null){
                var content = bitems[0];
                var index = bitems.index;
                var length = content.length;
                content = content.replace(id,replacer);
                file_content = file_content.substring(0,index) + begenv + content + endenv + file_content.substring(index+length,file_content.length);
            }
        };
        // block
        // TODO: math conflict
        block_searching(/(\n> .*)+/,/>/g,"","\n\\begin{block}{}","\n\\end{block}");
        // item
        block_searching(/(\n- .*)+/,/-/g,"\t\\item","\n\\begin{itemize}","\n\\end{itemize}");
        // enum
        block_searching(/(\n\d\. .*)+/,/\d\./g,"\t\\item","\n\\begin{enumerate}","\n\\end{enumerate}");
        
        // table
        while((titems = /(\|.*\|\n)+/.exec(file_content))!=null){
            var content = titems[0];
            var header = /\|.*\|\n/.exec(content);
            var column = "";
            var firstflag = true;
            for(c in header[0]){
                if (firstflag){
                    firstflag = false;
                    column += "\|";
                    continue;
                }
                if (header[0][c] == "\|")
                    column += "c\|";
            }
            var begenv = "\\begin{table}\n\\begin{tabular}{" + column + "}\n\\hline\n"
            var endenv = "\\end{tabular}\n\\end{table}\n"
            var index = titems.index;
            var length = content.length;
            content = content.replace(/\|(\-+\|)+\n/g,"");
            content = content.replace(/\|(.*)\|\n/g,"$1\\\\\\hline\n");
            content = content.replace(/\|/g, " & ");
            file_content = file_content.substring(0,index) + begenv + content + endenv + file_content.substring(index+length,file_content.length);
        }
        
        // verbatim
        file_content = file_content
            .replace(/```\n([^`]+)\n```/gm,"\\end{frame}\n\\begin\{frame\}\[allowframebreaks,fragile\]\n\\begin\{verbatim\}\n$1\n\\end\{verbatim\}\n\\end{frame}\n\\begin{frame}[allowframebreaks]\n")
            .replace(/```(.+)\n([^`]+)\n```/gm,"\\end{frame}\n\\begin\{frame\}\[allowframebreaks,fragile\]\n\\begin\{lstlisting\}\[language=$1\]\n$2\n\\end\{lstlisting\}\n\\end{frame}\n\\begin{frame}[allowframebreaks]\n")
            .replace(/`([^`]+)`/g,"\\texttt\{$1\}")
            .replace(/--+/g,"");
        // close
        file_content += "\n\\end{frame}\n\\end{document}";
        // cleanup
        file_content = file_content.replace(/\\begin\{frame\}\[allowframebreaks\]\n+\\end\{frame\}/gm,"");
        document.getElementById('beamerLaTeX').innerHTML = file_content;
        hljs.highlightBlock(document.getElementById('beamerLaTeX'));
        document.getElementById('buttonSaveFile').style.display = "inline-block";
        document.getElementById('textSection').style.display = "flex";
    }
});

function saveShareContent (content, fileName) {
    let downLink = document.createElement('a')
    downLink.download = fileName
    //字符内容转换为blob地址
    let blob = new Blob([content])
    downLink.href = URL.createObjectURL(blob)
    // 链接插入到页面
    document.body.appendChild(downLink)
    downLink.click()
    // 移除下载链接
    document.body.removeChild(downLink)
}

document.getElementById('buttonSaveFile').addEventListener("click",function(){
    var cdate = new Date();
    saveShareContent(document.getElementById('beamerLaTeX').innerText,"autobeamer" + cdate.toLocaleTimeString() + ".tex");
});

document.getElementById('buttonCompile').addEventListener("click", function(){
    // Use CJK for preview
    var raw = document.getElementById('beamerLaTeX').innerText;
    raw = raw.replace("\\documentclass\[UTF8\]\{ctexbeamer\}","\\documentclass\[draft\]\{beamer\}")
        .replace("\\usepackage\{ctex\}","\\usepackage\{CJKutf8\}")
        .replace("\\begin\{document\}","\\begin\{document\}\n\\begin\{CJK\}\{UTF8\}\{gbsn\}")
        .replace("\\end\{document\}","\\end\{CJK\}\\end\{document\}");

    document.getElementById('beamerOutput').src = "https://latexonline.cc/compile?text=" + encodeURIComponent(raw);
    document.getElementById('buttonCompile').innerText = "预览";
});

