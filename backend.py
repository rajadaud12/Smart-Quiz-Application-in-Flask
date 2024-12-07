# app.py
from flask import Flask, jsonify, request, render_template
import time
from functools import wraps
from questions_data import questions_tree
from search_algorithms import bfs_search, dfs_search, iterative_deepening_search


def time_algorithm(func):
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.perf_counter_ns()
        result = func(*args, **kwargs)
        end_time = time.perf_counter_ns()
        execution_time = end_time - start_time
        
        if isinstance(result, list):
            return result, execution_time
        elif isinstance(result, tuple):
            question, algorithm = result
            return question, algorithm, execution_time
        return result
    return wrapper

class Question:
    def __init__(self, question, options, correct_answer, difficulty):
        self.question = question
        self.options = options
        self.correct_answer = correct_answer
        self.difficulty = difficulty



class QuestionNode:
    def __init__(self, question_data=None, parent=None, actions=None):
        self.question_data = question_data
        self.parent = parent
        self.actions = actions or []
        self.depth = 0
        self.visited = False
        self.state = question_data

class QuestionTreeSingleton:
    _instance = None
    _tree_initialized = False
    
    @classmethod
    def get_instance(cls):
        if cls._instance is None:
            cls._instance = cls()
        return cls._instance
    
    def __init__(self):
        if not QuestionTreeSingleton._tree_initialized:
            self.root = None
            self.questions_by_difficulty = {
                'easy': [],
                'medium': [],
                'hard': []
            }
            self.graph = {}
            self._initialize_tree()
            QuestionTreeSingleton._tree_initialized = True
    
    def _calculate_difficulty_score(self, question):
        difficulty_scores = {'easy': 1, 'medium': 2, 'hard': 3}
        return difficulty_scores[question.difficulty]
    
    def _initialize_tree(self):
        all_questions = []
        for difficulty in ['easy', 'medium', 'hard']:
            for question in questions_tree[difficulty]:
                all_questions.append(question)
                self.questions_by_difficulty[difficulty].append(question)
        
        all_questions.sort(key=lambda x: self._calculate_difficulty_score(x))
        
        for question in all_questions:
            self.graph[question.question] = QuestionNode(question)
        
        for question_id, node in self.graph.items():
            difficulty_score = self._calculate_difficulty_score(node.question_data)
            node.actions = [q.question for q in all_questions 
                          if self._calculate_difficulty_score(q) == difficulty_score
                          and q.question != question_id]
        
        if all_questions:
            self.root = self.graph[all_questions[0].question]

    def _cycle_questions(self, current_results, difficulty, max_questions):
        if not current_results:
            return []
            
        final_results = []
        while len(final_results) < max_questions:
            for question in current_results:
                if len(final_results) < max_questions:
                    new_question = question.copy()
                    new_question['cycle'] = len(final_results) // len(current_results)
                    final_results.append(new_question)
                else:
                    break
                    
        return final_results


    def get_single_question(self, difficulty, algorithm, exclude_ids=None):
        exclude_ids = exclude_ids or []
        
        if algorithm == 'auto':
            algorithm = {
                'easy': 'bfs',
                'medium': 'iterative',
                'hard': 'dfs'
            }.get(difficulty, 'bfs')
        
        search_methods = {
            'bfs': bfs_search,
            'dfs': dfs_search,
            'iterative': iterative_deepening_search
        }
        
        questions, execution_time = search_methods[algorithm](self, difficulty, max_questions=1000)
        available_questions = [q for q in questions if q['question'] not in exclude_ids]
        
        if not available_questions and questions:
            available_questions = questions
            
        if available_questions:
            return available_questions[0], algorithm, execution_time
        return None, algorithm, 0

app = Flask(__name__)
question_tree = QuestionTreeSingleton.get_instance()

@app.route('/questions', methods=['GET'])
def get_questions():
    mode = request.args.get('mode', 'standard')
    difficulty = request.args.get('difficulty', 'easy')
    algorithm = request.args.get('algorithm', 'bfs')
    max_questions = min(int(request.args.get('max_questions', 1000)), 1000)
    exclude_ids = request.args.getlist('exclude_ids[]')

    search_functions = {
        'bfs': bfs_search,
        'dfs': dfs_search,
        'iterative': iterative_deepening_search
    }
    
    if mode == 'interactive':
        question, used_algorithm, execution_time = question_tree.get_single_question(
            difficulty, algorithm, exclude_ids
        )
        
        if question:
            return jsonify({
                'questions': [question],
                'algorithm': used_algorithm,
                'difficulty': difficulty,
                'execution_time': execution_time
            })
        return jsonify({'error': 'No more questions available'})

    questions, execution_time = search_functions[algorithm](question_tree, difficulty, max_questions)
    
    return jsonify({
        'questions': questions,
        'algorithm': algorithm,
        'difficulty': difficulty,
        'execution_time': execution_time
    })

@app.route('/')
def home():
    return render_template('index.html')

if __name__ == '__main__':
    app.run()