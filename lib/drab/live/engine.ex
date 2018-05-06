defmodule Drab.Live.Engine do
  @moduledoc """
  Drab Template Engine, uses `Drab.Live.EExEngine` to compile templates.

  ### Installation
  Add to config:

      config :phoenix, :template_engines,
        drab: Drab.Live.Engine
  """
  alias Drab.Live.Safe
  @behaviour Phoenix.Template.Engine

  @impl true
  def compile(path, _name) do
    {:drab, %Safe{safe: safe, partial: partial}} =
      path |> File.read!() |> EEx.compile_string(engine: Drab.Live.EExEngine, file: path, line: 1)

    module = module_name(partial.hash)
    IO.inspect(module)

    quoted =
      quote do
        def partial(), do: unquote(Macro.escape(partial))
        def path(), do: partial().path
        def hash(), do: partial().hash
        def amperes(), do: partial().amperes
      end

    Module.create(module, quoted, Macro.Env.location(__ENV__))
    # if String.contains?(path, "live_engine_test.html") do
    #   IO.inspect partial
    # end
    {:safe, safe}
  end

  @spec module_name(String.t()) :: atom
  @doc false
  def module_name(hash) do
    Module.concat([Drab, Live, Template] ++ [String.capitalize(hash)])
  end

  # def module_name(path) do
  #   dir = Path.dirname(path) |> Path.split() |> Enum.map(&String.capitalize/1)

  #   file =
  #     path
  #     |> Path.basename(Drab.Config.drab_extension())
  #     |> Path.basename(".html")
  #     |> String.capitalize()

  #   Module.concat([Drab, Live, Template] ++ dir ++ [file])
  # end
end
