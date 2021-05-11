document.getElementById('markdownInput').addEventListener("change",function(e){
    var mdfile = e.target.files[0];
    if(!mdfile) return;
    var reader = new FileReader();
    reader.readAsText(mdfile);
    reader.onload = function() {
        file_content = this.result;
        // # title
        // ## section 
        // ### subsection 
        // #### new frame
        // ##### boldface with a space
        file_content = file_content.replace(/\#\#\#\#\# (.+)/g,"\\par\\framebreak\n\\textbf{$1} ")
                                    .replace(/\#\#\#\# (.+)/g,"\\par\\framebreak\n\\end{frame}\n\\begin{frame}[allowframebreaks]\n\\frametitle{$1}")
                                    .replace(/\#\#\# (.+)/g,"\\end{frame}\n\\subsection{$1}\\begin{frame}[allowframebreaks]\n\\frametitle{$1}")
                                    .replace(/\#\# (.+)/g, "\\end{frame}\n\\section{$1}\n\\begin{frame}[allowframebreaks]")
                                    .replace(/\# (.+)/g, "\\documentclass[UTF8]{ctexbeamer}\n\\usetheme{CambridgeUS}\n\\usefonttheme{professionalfonts}\n\\begin{document}\n\\title{$1}\n\\maketitle\n\\begin{frame}[allowframebreaks]");
        file_content = file_content.replace(/\*\*(.*)\*\*/g,"\\textbf\{$1\}")  // boldface syntax
                                    .replace(/\*(.+)\*/g,"\\emph{$1}")  // italc syntax
                                    .replace(/\~\~(.*?)\~\~/g,"\\sout{$1}");    // delete line 
        // block syntax
        file_content = file_content.replace(/`([^`]+)`/g,"\\texttt\{$1\}")
                                    .replace(/```\n([\s\S]+)```/gm,"\\begin{verbatim}\n$1\n\\end{verbatim}")
                                    .replace(/```(.+)\n([\s\S]+)```/gm,"\\begin{lstlisting}[language=$1]\n$2\n\\end{lstlisting}")
                                    .replace(/-+/g,"")
                                    .replace(/> (.*)/g,"\\begin{block}\n$1\n\\end{block}");
        // final close
        file_content += "\n\\end{frame}\n\\end{document}";
        // final cleanup
        file_content = file_content.replace(/\\begin\{frame\}\[allowframebreaks\]\n\n\\end\{frame\}/gm,"");
        document.getElementById('beamerLaTeX').innerHTML = file_content;
    }
});

document.getElementById('buttonCompile').addEventListener("click", function(){
    document.getElementById('beamerOutput').src = "https://latexonline.cc/compile?text=" + document.getElementById('beamerLaTeX').innerHTML.replace(/\%.+/g,"").replace(/[+]/g,"%2B");
});