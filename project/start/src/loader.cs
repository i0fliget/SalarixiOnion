using System;
using System.IO;
using System.Threading;
using System.Diagnostics;

class Loader
{
  static void Main()
  {
    Console.WriteLine("------------ Загрузчик Salarixi Onion ------------");

    string[] services = new[]
    {
      "so-utils",
      "so-core",
      "so-interface"
    };

    foreach (string service in services)
    {
      KillOldProcess(service);
    }

    Thread.Sleep(2000);

    string[] possiblePaths = new[]
    {
      "./services/@.exe",
      "../services/@.exe",
      "./@.exe",
      "../@.exe",
      "../../services/@.exe",
      "../../@.exe",
      "../../@.exe"
    };

    foreach (string service in services)
    {
      bool status = false;

      foreach (string path in possiblePaths)
      {
        if (status) break;

        bool operation = StartProcess(path.Replace("@", service), service);

        if (operation)
        {
          Console.WriteLine($" Запуск ({service}) :: Сервис успешно запущен");
          status = true;
        }
      }

      if (!status)
      {
        Console.WriteLine($" Запуск ({service}) :: Не удалось запустить сервис");
      }
    }
  }

  static string GetFullPath(string path)
  {
    var fullPath = Path.GetFullPath(path);

    if (!File.Exists(fullPath))
    {
      return "";
    } else
    {
      return fullPath;
    }
  }

  static void KillOldProcess(string name)
  {
    if (Process.GetProcessesByName(name).Length > 0)
    {
      foreach (var process in Process.GetProcessesByName(name))
      {
        try
        {
          process.Kill(); 
          process.WaitForExit(3000); 
          Console.WriteLine($" Остановка ({name}) :: Процесс успешно остановлен (PID: {process.Id})");
        }
        catch (Exception ex)
        {
          Console.WriteLine($" Остановка ({name}) :: Не удалось остановить процесс (PID: {process.Id}): {ex.Message}");
        }
      }
    } else
    {
      Console.WriteLine($" Остановка ({name}) :: Процесс неактивен");
    }
  }

  static bool StartProcess(string path, string name)
  {
    string fullPath = GetFullPath(path);

    if (fullPath == "")
    {
      return false;
    }

    var psi = new ProcessStartInfo
    {
      FileName = "cmd.exe",
      Arguments = $"/c start \"{name}\" \"{fullPath}\"",
      UseShellExecute = true,
      CreateNoWindow = false,
      RedirectStandardOutput = false,
      RedirectStandardError = false
    };

    try
    {
      Process.Start(psi);
    }
    catch
    {
      return false;
    }

    Thread.Sleep(4000);

    if (Process.GetProcessesByName(name).Length > 0)
    {
      return true;
    } else
    {
      return false;
    }
  }
}