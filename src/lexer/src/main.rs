use std::fmt::{self, Display, Formatter};

pub enum TOKEN {
    ERROR       {message : String},
    COMMAND, 
    WORD, 
    CHARACTER, 
    BEGIN       {env: String}, 
    END         {env: String}, 
    CLASS       {env: String}
}

impl Display for TOKEN {
    fn fmt(&self, f: &mut Formatter) -> fmt::Result {
        match self {
            TOKEN::ERROR {message} => write!(f, "ERROR: {}", message),
            TOKEN::COMMAND => write!(f, "COMMAND"),
            TOKEN::WORD => write!(f, "WORD"),
            TOKEN::CHARACTER => write!(f, "CHARACTER"),
            TOKEN::BEGIN { env} => write!(f, "BEGIN: {}", env),
            TOKEN::END { env} => write!(f, "END: {}", env),
            TOKEN::CLASS { env } => write!(f, "CLASS: {}", env),
        }
    }
}

/// The lexer for the command token
fn command_lexer(_cstr : String){
    let mut state = 0;
    let mut t = TOKEN::COMMAND;
    let mut str_stack = String::new();
    for c in _cstr.chars() {
        match state {
            0 => {
                if c == '\\' { state = 1; }
                else { 
                    t = TOKEN::ERROR{message:String::from("Not a command.")};
                    break; 
                }
            }
            1 => {
                str_stack.push(c); 
                if str_stack.eq(&String::from("begin")) { str_stack.clear(); state = 2;}
                else if str_stack.eq(&String::from("end")) { str_stack.clear(); state = 6; }
                else if str_stack.eq(&String::from("documentclass")) { str_stack.clear(); state = 10; }
                else if str_stack.len() > 13 { break; }
                else { state = 1; }
            }
            2|6|10 => {
                if c=='{' { state = state + 1; }
                else if c=='[' && state==10 { state = 14; }
                else { break; }
            }
            3|7|11 => {
                if c.is_ascii_alphabetic() { 
                    str_stack.push(c);
                    state = state + 1;
                }
                else { break; }
            }
            4|8|12 => {
                if c=='}' { state = state + 1; }
                else if c.is_ascii_alphabetic() { 
                    str_stack.push(c);
                    state = state; 
                }
                else { break; }
            }
            5 => {
                t = TOKEN::BEGIN{env: String::clone(&str_stack)};
                break;
            }
            9 => {
                t = TOKEN::END{env: String::clone(&str_stack)};
                break;
            }
            13 => {
                t = TOKEN::CLASS{env: String::clone(&str_stack)};
                break;
            }
            14 => {
                if c.is_alphabetic() { state = 14; }
                else if c == ']' { state = 15; }
                else { break; }
            }
            15 => {
                if c == '}' { state = 11; }
                else { break; }
            }
            _ => break
        }
    }
    
    println!("{}",t);
}

/// The lexer for basic token
fn basic_lexer(_bstr : String) {
    let mut state = 0;
    let mut t = TOKEN::ERROR {message:String::from("Broke at beginning.")};
    for c in _bstr.chars() {
        match state {
            0 => {
                if c == '\\' { state = 1; }
                else if c.is_ascii_alphabetic() { state = 7; }
                else if !c.is_ascii_whitespace() { state = 8; }
                else { break; }
            }
            1 => {
                if c.is_ascii_alphabetic() { state = 2; }
                else { break; }
            }
            2 => {
                t = TOKEN::COMMAND;
                if c.is_ascii_alphabetic() { state = 2; }
                else if c == '[' { state = 3; }
                else if c == '{' { state = 5; }
                else { break; }
            }
            3 => {
                if c == ']' { state = 2; }
                else { state = 4; }
            }
            4 => {
                if c == ']' { state = 2; }
                else { state = 4; }
            }
            5 => {
                if c == '}' { state = 2; }
                else { state = 6; }
            }
            6 => {
                if c == '}' { state = 2; }
                else { state = 6; }
            }
            7 => {
                t = TOKEN::WORD;
                if c.is_ascii_alphabetic() { state = 7; }
                else { break; }
            }
            8 => {
                t = TOKEN::CHARACTER;
                break;
            }
            _ => { break; }
        }
    }
    println!("{}",t);
}

fn main() {
    // The string in Rust is not ended by \0
    basic_lexer("我\0".to_string());
    command_lexer("\\begin{document}\0".to_string());
}
