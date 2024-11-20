from functools import wraps
import time

def time_algorithm(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter_ns()
        result = func(*args, **kwargs)
        end_time = time.perf_counter_ns()
        execution_time = end_time - start_time
        return result, execution_time
    return wrapper

@time_algorithm
def bfs_search(tree, difficulty, max_questions=1000):
    if not tree.root:
        return []

    initial_questions = [q.question for q in tree.questions_by_difficulty[difficulty]]
    if not initial_questions:
        return []

    result = []
    frontier = initial_questions.copy()
    explored = set()
    
    while frontier:
        current_node = frontier.pop(0)
        if current_node not in explored:
            explored.add(current_node)

            # Add questions of matching difficulty to result
            if tree.graph[current_node].question_data.difficulty == difficulty:
                path = [current_node]
                result.append({
                    'question': tree.graph[current_node].question_data.question,
                    'options': tree.graph[current_node].question_data.options.copy(),
                    'correct_answer': tree.graph[current_node].question_data.correct_answer,
                    'depth': 0,
                    'path': path
                })

            # Add unvisited children to the frontier
            for child in tree.graph[current_node].actions:
                if child not in explored and child not in frontier:
                    tree.graph[child].parent = current_node
                    frontier.append(child)
    
    return tree._cycle_questions(result, difficulty, max_questions)

@time_algorithm
def dfs_search(tree, difficulty, max_questions=1000):
    if not tree.root:
        return []

    initial_questions = [q.question for q in tree.questions_by_difficulty[difficulty]]
    if not initial_questions:
        return []

    result = []
    frontier = initial_questions.copy()
    explored = set()
    
    while frontier:
        current_node = frontier.pop()
        if current_node not in explored:
            explored.add(current_node)

            # Add questions of matching difficulty to result
            if tree.graph[current_node].question_data.difficulty == difficulty:
                path = [current_node]
                result.append({
                    'question': tree.graph[current_node].question_data.question,
                    'options': tree.graph[current_node].question_data.options.copy(),
                    'correct_answer': tree.graph[current_node].question_data.correct_answer,
                    'depth': 0,
                    'path': path
                })

            # Add unvisited children to the frontier in reverse order
            for child in reversed(tree.graph[current_node].actions):
                if child not in explored and child not in frontier:
                    tree.graph[child].parent = current_node
                    frontier.append(child)
    
    return tree._cycle_questions(result, difficulty, max_questions)

@time_algorithm
def iterative_deepening_search(tree, difficulty, max_depth=5, max_questions=1000):
    if not tree.root:
        return []

    initial_questions = [q.question for q in tree.questions_by_difficulty[difficulty]]
    if not initial_questions:
        return []

    result = []
    visited = set()
    
    for depth in range(max_depth):
        for start_node in initial_questions:
            frontier = [start_node]
            current_visited = set()
            
            while frontier:
                current_node = frontier.pop()
                if current_node not in current_visited:
                    current_visited.add(current_node)

                    # Add questions of matching difficulty to result if not visited before
                    if tree.graph[current_node].question_data.difficulty == difficulty and current_node not in visited:
                        visited.add(current_node)
                        result.append({
                            'question': tree.graph[current_node].question_data.question,
                            'options': tree.graph[current_node].question_data.options.copy(),
                            'correct_answer': tree.graph[current_node].question_data.correct_answer,
                            'depth': depth,
                            'path': [current_node]
                        })

                    # Add children if depth limit not exceeded
                    if depth > 0:
                        for child in reversed(tree.graph[current_node].actions):
                            if child not in current_visited:
                                tree.graph[child].parent = current_node
                                frontier.append(child)
    
    return tree._cycle_questions(result, difficulty, max_questions)
