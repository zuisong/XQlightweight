use std::io::{self, BufRead};
use xq_engine_wasm::{Position, Search};

fn main() {
    let stdin = io::stdin();
    let mut lines = stdin.lock().lines();
    let mut pos = Position::new();
    // Initialize with startpos
    pos.from_fen("rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1");

    loop {
        let line = match lines.next() {
            Some(Ok(l)) => l,
            Some(Err(_)) => break,
            None => break,
        };

        let line = line.trim();
        if line.is_empty() {
            continue;
        }

        let parts: Vec<&str> = line.split_whitespace().collect();
        let cmd = parts[0];

        match cmd {
            "ucci" => {
                println!("id name XQlightweight Native");
                println!("id author Morning Yellow, adapted by Gemini");
                println!("ucciok");
            }
            "isready" => {
                println!("readyok");
            }
            "position" => {
                if parts.len() > 1 {
                    handle_position(&mut pos, &parts[1..]);
                }
            }
            "go" => {
                handle_go(&pos, &parts[1..]);
            }
            "quit" => {
                break;
            }
            _ => {}
        }
    }
}

fn handle_position(pos: &mut Position, args: &[&str]) {
    let mut fen = "rnbakabnr/9/1c5c1/p1p1p1p1p/9/9/P1P1P1P1P/1C5C1/9/RNBAKABNR w - - 0 1";
    let mut moves_start_index = 0;

    if args[0] == "startpos" {
        pos.from_fen(fen);
        moves_start_index = 1;
    } else if args[0] == "fen" {
        // Reconstruct FEN from args until "moves" or end
        let mut fen_parts = Vec::new();
        let mut i = 1;
        while i < args.len() && args[i] != "moves" {
            fen_parts.push(args[i]);
            i += 1;
        }
        // Join with space, but we have a slice of &str.
        // We need to handle this carefully. 
        // Actually, FEN strings can contain spaces.
        // Simple approach: join everything between "fen" and "moves".
        let fen_string = fen_parts.join(" ");
        pos.from_fen(&fen_string);
        moves_start_index = i;
    }

    if moves_start_index < args.len() && args[moves_start_index] == "moves" {
        for i in (moves_start_index + 1)..args.len() {
            let move_str = args[i];
            // We need a way to parse UCCI move string to internal move.
            // But `Position` doesn't have `ucciMoveToInternal` helper exposed easily?
            // `XiangQiEngine` in TS had it. `Position` has `make_move(u16)`.
            // We need to implement UCCI parsing in Rust or expose helpers.
            // `lib.rs` has `make_move(sq_src, sq_dst)`.
            // We need `ucci_to_move` helper.
            
            if let Some(mv) = ucci_to_move(move_str) {
                pos.make_move(mv);
            }
        }
    }
}

fn handle_go(pos: &Position, args: &[&str]) {
    // Parse depth/time
    let mut depth = 3; // Default
    let mut time = 2000; // Default

    let mut i = 0;
    while i < args.len() {
        match args[i] {
            "depth" => {
                if i + 1 < args.len() {
                    if let Ok(d) = args[i+1].parse() {
                        depth = d;
                    }
                    i += 1;
                }
            }
            "movetime" => {
                 if i + 1 < args.len() {
                    if let Ok(t) = args[i+1].parse() {
                        time = t;
                    }
                    i += 1;
                }
            }
            _ => {}
        }
        i += 1;
    }

    // Search needs a clone of position? 
    // Our modified `Search::new` takes `&Position`.
    let mut search = Search::new(pos, 16);
    let best_move = search.search_main(time, depth);
    
    if best_move == 0 {
        println!("bestmove nomove");
    } else {
        println!("bestmove {}", move_to_ucci(best_move));
    }
}

// Helper functions for UCCI conversion
// Copied/Adapted from TS logic or implemented using lib.rs constants if available.
// But lib.rs constants are `pub`.

use xq_engine_wasm::{FILE_LEFT, RANK_TOP, src, dst, file_x, rank_y};

fn ucci_to_move(ucci: &str) -> Option<u16> {
    if ucci.len() != 4 {
        return None;
    }
    let chars: Vec<char> = ucci.chars().collect();
    let src_file = (chars[0] as u8).wrapping_sub(b'a') + 3;
    let src_rank = 9 - (chars[1] as u8).wrapping_sub(b'0') + 3;
    let dst_file = (chars[2] as u8).wrapping_sub(b'a') + 3;
    let dst_rank = 9 - (chars[3] as u8).wrapping_sub(b'0') + 3;

    if src_file < 3 || src_file > 11 || src_rank < 3 || src_rank > 12 {
        return None;
    }
    if dst_file < 3 || dst_file > 11 || dst_rank < 3 || dst_rank > 12 {
        return None;
    }

    let src_sq = (src_rank << 4) + src_file;
    let dst_sq = (dst_rank << 4) + dst_file;
    
    Some((src_sq as u16) + ((dst_sq as u16) << 8))
}

fn move_to_ucci(mv: u16) -> String {
    let src_sq = src(mv);
    let dst_sq = dst(mv);
    
    let src_file = file_x(src_sq) - FILE_LEFT;
    let src_rank = RANK_TOP + 9 - rank_y(src_sq);
    
    let dst_file = file_x(dst_sq) - FILE_LEFT;
    let dst_rank = RANK_TOP + 9 - rank_y(dst_sq);
    
    format!("{}{}{}{}", 
        (b'a' + src_file) as char,
        src_rank,
        (b'a' + dst_file) as char,
        dst_rank
    )
}
