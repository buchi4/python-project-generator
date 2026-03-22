export interface PythonProject {
  id: string;
  name: string;
  description: string;
  code: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  category: string;
}

export const PREBUILT_PROJECTS: PythonProject[] = [
  {
    id: 'calculator',
    name: 'Simple Calculator',
    description: 'A basic command-line calculator that performs addition, subtraction, multiplication, and division.',
    difficulty: 'Beginner',
    category: 'Utility',
    code: `def add(x, y):
    return x + y

def subtract(x, y):
    return x - y

def multiply(x, y):
    return x * y

def divide(x, y):
    if y == 0:
        return "Error! Division by zero."
    return x / y

print("Select operation:")
print("1.Add")
print("2.Subtract")
print("3.Multiply")
print("4.Divide")

while True:
    choice = input("Enter choice(1/2/3/4): ")

    if choice in ('1', '2', '3', '4'):
        num1 = float(input("Enter first number: "))
        num2 = float(input("Enter second number: "))

        if choice == '1':
            print(num1, "+", num2, "=", add(num1, num2))

        elif choice == '2':
            print(num1, "-", num2, "=", subtract(num1, num2))

        elif choice == '3':
            print(num1, "*", num2, "=", multiply(num1, num2))

        elif choice == '4':
            print(num1, "/", num2, "=", divide(num1, num2))
        
        next_calculation = input("Let's do next calculation? (yes/no): ")
        if next_calculation.lower() == "no":
          break
    else:
        print("Invalid Input")`
  },
  {
    id: 'todo-list',
    name: 'To-Do List Manager',
    description: 'A simple command-line application to manage your daily tasks.',
    difficulty: 'Beginner',
    category: 'Productivity',
    code: `tasks = []

def show_menu():
    print("\\n--- TO-DO LIST ---")
    print("1. View Tasks")
    print("2. Add Task")
    print("3. Remove Task")
    print("4. Exit")

def view_tasks():
    if not tasks:
        print("Your to-do list is empty.")
    else:
        for i, task in enumerate(tasks, 1):
            print(f"{i}. {task}")

def add_task():
    task = input("Enter the task: ")
    tasks.append(task)
    print("Task added!")

def remove_task():
    view_tasks()
    if tasks:
        try:
            task_num = int(input("Enter the task number to remove: "))
            if 1 <= task_num <= len(tasks):
                removed = tasks.pop(task_num - 1)
                print(f"Removed: {removed}")
            else:
                print("Invalid task number.")
        except ValueError:
            print("Please enter a valid number.")

while True:
    show_menu()
    choice = input("Choose an option (1-4): ")
    
    if choice == '1':
        view_tasks()
    elif choice == '2':
        add_task()
    elif choice == '3':
        remove_task()
    elif choice == '4':
        print("Goodbye!")
        break
    else:
        print("Invalid choice, please try again.")`
  },
  {
    id: 'guess-number',
    name: 'Guess the Number',
    description: 'A fun game where the computer picks a random number and you have to guess it.',
    difficulty: 'Beginner',
    category: 'Game',
    code: `import random

def guess_number():
    number_to_guess = random.randint(1, 100)
    attempts = 0
    print("I'm thinking of a number between 1 and 100.")

    while True:
        try:
            user_guess = int(input("Enter your guess: "))
            attempts += 1

            if user_guess < number_to_guess:
                print("Too low! Try again.")
            elif user_guess > number_to_guess:
                print("Too high! Try again.")
            else:
                print(f"Congratulations! You guessed it in {attempts} attempts.")
                break
        except ValueError:
            print("Please enter a valid integer.")

if __name__ == "__main__":
    guess_number()`
  }
];
