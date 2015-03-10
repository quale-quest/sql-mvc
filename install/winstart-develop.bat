
@IF EXIST "%ProgramFiles%\Notepad++\notepad++.exe" (
  start /b "" "%ProgramFiles%\Notepad++\notepad++.exe" "C:\SQL-MVC\node_modules\sql-mvc\Quale\Standard\Home\Guest\Index.quicc" "C:\SQL-MVC\node_modules\sql-mvc\Quale\Standard\Home\Guest\Models\TodoModel.quicc" "C:\SQL-MVC\node_modules\sql-mvc\Quale\Standard\Home\Guest\Controllers\TodoController.quicc"
)

@IF EXIST "%ProgramFiles(x86)%\Notepad++\notepad++.exe" (
  start /b "" "%ProgramFiles(x86)%\Notepad++\notepad++.exe" "C:\SQL-MVC\node_modules\sql-mvc\Quale\Standard\Home\Guest\Index.quicc" "C:\SQL-MVC\node_modules\sql-mvc\Quale\Standard\Home\Guest\Models\TodoModel.quicc" "C:\SQL-MVC\node_modules\sql-mvc\Quale\Standard\Home\Guest\Controllers\TodoController.quicc"
)
