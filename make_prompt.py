import os
import fnmatch
import argparse

def should_exclude(path, exclude_patterns):
    return any(fnmatch.fnmatch(path, pattern) for pattern in exclude_patterns)

def should_include(file, include_extensions):
    return not include_extensions or any(file.endswith(ext) for ext in include_extensions)

def merge_files(root_dir, output_file, exclude_patterns, include_extensions):
    added_files = []
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        for root, dirs, files in os.walk(root_dir):
            # Исключаем папки
            dirs[:] = [d for d in dirs if not should_exclude(os.path.join(root, d), exclude_patterns)]
            
            for file in files:
                file_path = os.path.join(root, file)
                relative_path = os.path.relpath(file_path, root_dir)
                
                if not should_exclude(file, exclude_patterns) and should_include(file, include_extensions):
                    try:
                        with open(file_path, 'r', encoding='utf-8') as infile:
                            content = infile.read()
                            
                        outfile.write(f"--- {relative_path} ---\n")
                        outfile.write(content)
                        outfile.write("\n\n")
                        
                        added_files.append(relative_path)
                    except Exception as e:
                        print(f"Ошибка при обработке файла {file_path}: {str(e)}")

    return added_files

def main():
    parser = argparse.ArgumentParser(description="Объединение файлов с фильтрацией по расширению и исключениям")
    parser.add_argument(
        "--include", 
        nargs="*", 
        default=[
            '.ts',
            '.vue',
        ], 
        help="Расширения файлов для включения (например, .py .txt)"
    )
    parser.add_argument(
        "--exclude", 
        nargs="*", 
        default=[
            '*.pdea*',
            '*node_modules*',
            '*.nuxt*',
            '*.js',
            '*.json',
            '*.yaml',
            '*.ico',
            '*.md',
        ], 
        help="Шаблоны для исключения файлов и папок"
    )
    parser.add_argument("--output", default="project.txt", help="Имя выходного файла")
    args = parser.parse_args()

    root_directory = '.'  # Текущая папка
    include_extensions = args.include if args.include else []
    exclude_patterns = args.exclude
    output_file = args.output

    # Запуск процесса слияния
    added_files = merge_files(root_directory, output_file, exclude_patterns, include_extensions)

    # Вывод списка добавленных файлов
    print("Добавленные файлы:")
    for file in added_files:
        print(file)

    print(f"\nВсего добавлено файлов: {len(added_files)}")
    print(f"Результат сохранен в файле: {output_file}")

if __name__ == "__main__":
    main()