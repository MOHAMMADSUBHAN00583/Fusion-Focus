import tkinter as tk
import random
import time

class Game2048:
    def __init__(self, master):
        self.master = master
        self.master.title("2048 Game")
        self.master.geometry("500x600")
        self.master.resizable(False, False)

        self.colors = {
            "0": "#ccc0b3", "2": "#eee4da", "4": "#ece0c8",
            "8": "#f2b179", "16": "#f59563", "32": "#f67c5f",
            "64": "#f65e3b", "128": "#edcf72", "256": "#edcc61",
            "512": "#edc850", "1024": "#edc53f", "2048": "#edc22e"
        }

        self.grid_size = 4
        self.board = [[0] * self.grid_size for _ in range(self.grid_size)]
        self.score = 0
        self.previous_board = []

        self.init_gui()
        self.add_new_tile()
        self.add_new_tile()
        self.update_gui()

    def init_gui(self):
        # Background frame for the game grid
        self.frame = tk.Frame(self.master, bg="#bbada0", width=500, height=500)
        self.frame.pack(pady=20)

        # Grid of tiles
        self.tiles = []
        for i in range(self.grid_size):
            row = []
            for j in range(self.grid_size):
                label = tk.Label(self.frame, text="", bg=self.colors["0"], font=("Arial", 30, "bold"), width=4, height=2)
                label.grid(row=i, column=j, padx=5, pady=5)
                row.append(label)
            self.tiles.append(row)

        # Score and High Score
        self.score_frame = tk.Frame(self.master, bg="#bbada0")
        self.score_frame.pack()
        self.score_label = tk.Label(self.score_frame, text="Score: 0", font=("Arial", 16), bg="#bbada0", fg="#ffffff")
        self.score_label.grid(row=0, column=0, padx=10)
        self.high_score_label = tk.Label(self.score_frame, text=f"High Score: {self.update_high_score()}", font=("Arial", 16), bg="#bbada0", fg="#ffffff")
        self.high_score_label.grid(row=0, column=1, padx=10)

        # Bind keyboard input
        self.master.bind("<KeyPress>", self.key_press)

    def add_new_tile(self):
        empty_tiles = [(i, j) for i in range(self.grid_size) for j in range(self.grid_size) if self.board[i][j] == 0]
        if empty_tiles:
            i, j = random.choice(empty_tiles)
            self.board[i][j] = 2 if random.random() < 0.9 else 4

    def update_gui(self):
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                value = self.board[i][j]
                self.tiles[i][j].config(
                    text=str(value) if value != 0 else "",
                    bg=self.colors[str(value)],
                    fg="#776e65" if value < 8 else "#f9f6f2"
                )
        self.score_label.config(text=f"Score: {self.score}")
        self.high_score_label.config(text=f"High Score: {self.update_high_score()}")
        self.master.update_idletasks()

    def key_press(self, event):
        key = event.keysym
        if key in ["Up", "Down", "Left", "Right"]:
            self.previous_board = [row[:] for row in self.board]
            if self.make_move(key):
                self.add_new_tile()
                self.animate_tiles()
            self.update_gui()
            if self.is_game_over():
                self.game_over()

    def make_move(self, direction):
        def slide(row):
            new_row = [i for i in row if i != 0]
            for i in range(len(new_row) - 1):
                if new_row[i] == new_row[i + 1]:
                    new_row[i] *= 2
                    self.score += new_row[i]
                    new_row[i + 1] = 0
            return [i for i in new_row if i != 0] + [0] * (self.grid_size - len(new_row))

        def rotate_board():
            self.board = [list(row) for row in zip(*self.board[::-1])]

        moved = False
        for _ in range(["Up", "Right", "Down", "Left"].index(direction)):
            rotate_board()
        for i in range(self.grid_size):
            original_row = self.board[i][:]
            self.board[i] = slide(self.board[i])
            if self.board[i] != original_row:
                moved = True
        for _ in range(4 - ["Up", "Right", "Down", "Left"].index(direction)):
            rotate_board()
        return moved

    def animate_tiles(self):
        # Simulate animation by updating the tiles multiple times
        for _ in range(5):
            self.update_gui()
            time.sleep(0.05)

    def is_game_over(self):
        if any(0 in row for row in self.board):
            return False
        for i in range(self.grid_size):
            for j in range(self.grid_size):
                if j + 1 < self.grid_size and self.board[i][j] == self.board[i][j + 1]:
                    return False
                if i + 1 < self.grid_size and self.board[i][j] == self.board[i + 1][j]:
                    return False
        return True

    def game_over(self):
        self.master.unbind("<KeyPress>")
        game_over_label = tk.Label(self.master, text="Game Over!", font=("Arial", 30), bg="#bbada0", fg="#ffffff")
        game_over_label.pack(pady=20)

    def update_high_score(self):
        try:
            with open("high_score.txt", "r") as file:
                high_score = int(file.readline().strip())
        except FileNotFoundError:
            high_score = 0
        if self.score > high_score:
            with open("high_score.txt", "w") as file:
                file.write(str(self.score))
        return max(self.score, high_score)

if __name__ == "__main__":
    root = tk.Tk()
    game = Game2048(root)
    root.mainloop()
