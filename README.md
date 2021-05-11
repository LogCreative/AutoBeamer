# AutoBeamer
A package to provide macros for auto-splitting regular LaTeX document into beamer.

震惊！几行代码在 LaTeX 内实现幻灯片自动排版！

```LaTeX
\documentclass{beamer}
\usepackage{autobeamer} % put autobeamer.sty in the same folder

% Your original dependencies here ...

\begin{document}
    \begin{frame}[allowframebreaks]
        % Your full article ...
    \end{frame}
\end{document}

```