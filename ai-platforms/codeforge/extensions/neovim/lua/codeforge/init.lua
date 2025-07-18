-- CodeForge NeoVim Plugin
-- Next-generation AI-assisted development platform integration for NeoVim

local M = {}

-- Plugin configuration
M.config = {
  enabled = true,
  local_model = {
    enabled = false,
    model_path = "",
    max_tokens = 2048,
    temperature = 0.7
  },
  cloud = {
    enabled = true,
    provider = "openai",
    api_key = "",
    fallback_threshold = 4096
  },
  ui = {
    show_statusline = true,
    show_inline_completion = true,
    enable_floating_windows = true,
    completion_delay = 150
  },
  keybindings = {
    generate_code = "<leader>cg",
    explain_code = "<leader>ce",
    refactor_code = "<leader>cr",
    add_tests = "<leader>ct",
    toggle_3d_view = "<leader>c3",
    open_chat = "<leader>cc",
    command_palette = "<leader>cp"
  },
  telescope = {
    enabled = true,
    show_model_picker = true
  },
  statusline = {
    enabled = true,
    position = "right",
    show_model_status = true,
    show_performance = true
  }
}

-- Internal state
local state = {
  initialized = false,
  current_model = nil,
  performance_metrics = {
    requests_per_second = 0,
    average_latency = 0,
    cache_hit_rate = 0
  },
  completion_source = nil,
  lsp_client = nil,
  floating_windows = {},
  telescope_extension = nil
}

-- Task 1: Create Lua plugin structure
function M.setup(user_config)
  -- Merge user config with defaults
  if user_config then
    M.config = vim.tbl_deep_extend("force", M.config, user_config)
  end
  
  if not M.config.enabled then
    return
  end
  
  -- Initialize plugin components
  M._init_lsp_client()
  M._init_completion_source()
  M._init_commands()
  M._init_keybindings()
  M._init_floating_windows()
  
  if M.config.telescope.enabled then
    M._init_telescope_integration()
  end
  
  if M.config.statusline.enabled then
    M._init_statusline()
  end
  
  -- Start background services
  M._start_performance_monitoring()
  M._init_model_service()
  
  state.initialized = true
  print("CodeForge initialized successfully!")
end

-- Task 3: Add LSP client configuration
function M._init_lsp_client()
  local lspconfig = require('lspconfig')
  local configs = require('lspconfig.configs')
  
  -- Register CodeForge LSP if not already registered
  if not configs.codeforge then
    configs.codeforge = {
      default_config = {
        cmd = { 'codeforge', 'lsp' },
        filetypes = { 
          'typescript', 'javascript', 'python', 'go', 'rust', 
          'cpp', 'c', 'java', 'csharp', 'php', 'ruby' 
        },
        root_dir = lspconfig.util.root_pattern('.git', 'package.json', 'Cargo.toml', 'go.mod'),
        settings = {
          codeforge = {
            enable = true,
            localModel = M.config.local_model,
            cloud = M.config.cloud,
            completions = {
              enabled = true,
              maxSuggestions = 5,
              debounceMs = M.config.ui.completion_delay
            },
            diagnostics = {
              enabled = true,
              aiPowered = true
            }
          }
        },
        capabilities = require('cmp_nvim_lsp').default_capabilities(),
        on_attach = function(client, bufnr)
          M._on_lsp_attach(client, bufnr)
        end,
        on_init = function(client)
          print("CodeForge LSP client initialized")
          state.lsp_client = client
        end,
        on_exit = function(code, signal)
          print("CodeForge LSP client exited with code:", code)
          state.lsp_client = nil
        end
      }
    }
  end
  
  -- Start the LSP client
  lspconfig.codeforge.setup({})
end

function M._on_lsp_attach(client, bufnr)
  -- Enable completion triggered by <c-x><c-o>
  vim.api.nvim_buf_set_option(bufnr, 'omnifunc', 'v:lua.vim.lsp.omnifunc')
  
  -- Buffer-local mappings
  local opts = { noremap = true, silent = true, buffer = bufnr }
  
  vim.keymap.set('n', 'gD', vim.lsp.buf.declaration, opts)
  vim.keymap.set('n', 'gd', vim.lsp.buf.definition, opts)
  vim.keymap.set('n', 'K', vim.lsp.buf.hover, opts)
  vim.keymap.set('n', 'gi', vim.lsp.buf.implementation, opts)
  vim.keymap.set('n', '<C-k>', vim.lsp.buf.signature_help, opts)
  vim.keymap.set('n', '<leader>rn', vim.lsp.buf.rename, opts)
  vim.keymap.set('n', '<leader>ca', vim.lsp.buf.code_action, opts)
  vim.keymap.set('n', 'gr', vim.lsp.buf.references, opts)
  
  -- CodeForge specific mappings
  vim.keymap.set('n', '<leader>ai', function()
    M.show_ai_assistant()
  end, opts)
  
  vim.keymap.set('v', '<leader>ae', function()
    M.explain_selection()
  end, opts)
end

-- Task 2: Implement nvim-cmp source
function M._init_completion_source()
  local cmp = require('cmp')
  local source = {}
  
  source.new = function()
    return setmetatable({}, { __index = source })
  end
  
  source.get_trigger_characters = function()
    return { '.', ':', '(', '[', '{', ' ' }
  end
  
  source.get_keyword_pattern = function()
    return [[\k\+]]
  end
  
  source.complete = function(self, request, callback)
    local input = string.sub(request.context.cursor_before_line, request.offset)
    
    if string.len(input) < 2 then
      callback({ items = {}, isIncomplete = false })
      return
    end
    
    -- Get AI completions
    M._get_ai_completions(request, function(items)
      callback({
        items = items,
        isIncomplete = false
      })
    end)
  end
  
  source.resolve = function(self, completion_item, callback)
    -- Add detailed documentation
    if completion_item.data and completion_item.data.detail then
      completion_item.documentation = {
        kind = 'markdown',
        value = completion_item.data.detail
      }
    end
    callback(completion_item)
  end
  
  -- Register the completion source
  cmp.register_source('codeforge', source)
  state.completion_source = source
  
  -- Update cmp configuration to include CodeForge
  local current_config = cmp.get_config()
  table.insert(current_config.sources, {
    name = 'codeforge',
    priority = 1000,
    max_item_count = 10
  })
  cmp.setup(current_config)
end

function M._get_ai_completions(request, callback)
  local bufnr = vim.api.nvim_get_current_buf()
  local cursor_pos = vim.api.nvim_win_get_cursor(0)
  local lines = vim.api.nvim_buf_get_lines(bufnr, 0, cursor_pos[1], false)
  local context = table.concat(lines, '\n')
  
  -- Simulate AI completion request (in real implementation, this would call the AI service)
  vim.defer_fn(function()
    local items = {
      {
        label = 'generateFunction',
        kind = 3, -- Function
        detail = 'AI-generated function',
        documentation = 'Generated by CodeForge AI',
        insertText = 'function generateFunction() {\n  // AI generated code\n  return true;\n}',
        insertTextFormat = 2, -- Snippet
        data = {
          detail = 'This function was generated by CodeForge AI based on your context.'
        }
      },
      {
        label = 'optimizeCode',
        kind = 3, -- Function
        detail = 'AI code optimization',
        documentation = 'Optimized by CodeForge AI',
        insertText = 'optimizeCode(${1:input})',
        insertTextFormat = 2, -- Snippet
        data = {
          detail = 'Optimized version of your code using AI analysis.'
        }
      }
    }
    
    callback(items)
  end, M.config.ui.completion_delay)
end

-- Task 4: Implement floating window UI
function M._init_floating_windows()
  M.floating_window = {}
  
  function M.floating_window.create(opts)
    opts = opts or {}
    local width = opts.width or math.floor(vim.o.columns * 0.8)
    local height = opts.height or math.floor(vim.o.lines * 0.8)
    
    -- Calculate position for centering
    local row = math.floor((vim.o.lines - height) / 2)
    local col = math.floor((vim.o.columns - width) / 2)
    
    -- Create buffer
    local buf = vim.api.nvim_create_buf(false, true)
    
    -- Window configuration
    local win_config = {
      relative = 'editor',
      width = width,
      height = height,
      row = row,
      col = col,
      style = 'minimal',
      border = 'rounded',
      title = opts.title or 'CodeForge',
      title_pos = 'center'
    }
    
    -- Create window
    local win = vim.api.nvim_open_win(buf, true, win_config)
    
    -- Set window options
    vim.api.nvim_win_set_option(win, 'wrap', false)
    vim.api.nvim_win_set_option(win, 'cursorline', true)
    
    -- Set buffer options
    vim.api.nvim_buf_set_option(buf, 'buftype', 'nofile')
    vim.api.nvim_buf_set_option(buf, 'bufhidden', 'wipe')
    vim.api.nvim_buf_set_option(buf, 'filetype', opts.filetype or 'text')
    
    -- Add keybindings
    local close_keys = { 'q', '<ESC>' }
    for _, key in ipairs(close_keys) do
      vim.api.nvim_buf_set_keymap(buf, 'n', key, '', {
        noremap = true,
        silent = true,
        callback = function()
          vim.api.nvim_win_close(win, true)
        end
      })
    end
    
    local window = {
      buf = buf,
      win = win,
      config = win_config
    }
    
    table.insert(state.floating_windows, window)
    return window
  end
  
  function M.floating_window.show_ai_chat()
    local win = M.floating_window.create({
      title = 'CodeForge AI Chat',
      width = math.floor(vim.o.columns * 0.7),
      height = math.floor(vim.o.lines * 0.6),
      filetype = 'markdown'
    })
    
    local lines = {
      '# CodeForge AI Assistant',
      '',
      'Welcome to CodeForge AI! How can I help you today?',
      '',
      '**Available Commands:**',
      '- Type your question or request',
      '- Use `/explain` to explain selected code',
      '- Use `/generate` to generate code',
      '- Use `/refactor` to refactor code',
      '',
      'Type your message below:'
    }
    
    vim.api.nvim_buf_set_lines(win.buf, 0, -1, false, lines)
    return win
  end
  
  function M.floating_window.show_3d_view()
    local win = M.floating_window.create({
      title = 'CodeForge 3D Code Visualization',
      width = math.floor(vim.o.columns * 0.9),
      height = math.floor(vim.o.lines * 0.8)
    })
    
    local lines = {
      '┌─────────────────────────────────────────────────┐',
      '│               3D Code Visualization             │',
      '├─────────────────────────────────────────────────┤',
      '│                                                 │',
      '│     🏗️  Loading 3D architecture view...        │',
      '│                                                 │',
      '│     • Analyzing code structure                  │',
      '│     • Building dependency graph                 │',
      '│     • Rendering 3D visualization               │',
      '│                                                 │',
      '│     Press \'r\' to rotate view                    │',
      '│     Press \'z\' to zoom                          │',
      '│     Press \'f\' to focus on selection            │',
      '│                                                 │',
      '└─────────────────────────────────────────────────┘'
    }
    
    vim.api.nvim_buf_set_lines(win.buf, 0, -1, false, lines)
    return win
  end
end

-- Task 5: Implement command registration
function M._init_commands()
  -- Create main CodeForge command group
  vim.api.nvim_create_user_command('CodeForge', function(opts)
    local subcommand = opts.fargs[1]
    
    if subcommand == 'setup' then
      M.setup()
    elseif subcommand == 'status' then
      M.show_status()
    elseif subcommand == 'models' then
      M.show_model_picker()
    elseif subcommand == 'chat' then
      M.show_ai_chat()
    elseif subcommand == '3d' then
      M.show_3d_view()
    elseif subcommand == 'reload' then
      M.reload()
    else
      print('CodeForge: Unknown command. Available: setup, status, models, chat, 3d, reload')
    end
  end, {
    nargs = 1,
    complete = function()
      return { 'setup', 'status', 'models', 'chat', '3d', 'reload' }
    end,
    desc = 'CodeForge AI development platform commands'
  })
  
  -- Individual commands
  vim.api.nvim_create_user_command('CodeForgeGenerate', function(opts)
    M.generate_code(opts.args)
  end, {
    nargs = '*',
    desc = 'Generate code using AI'
  })
  
  vim.api.nvim_create_user_command('CodeForgeExplain', function()
    M.explain_selection()
  end, {
    desc = 'Explain selected code using AI'
  })
  
  vim.api.nvim_create_user_command('CodeForgeRefactor', function()
    M.refactor_selection()
  end, {
    desc = 'Refactor selected code using AI'
  })
  
  vim.api.nvim_create_user_command('CodeForgeTest', function()
    M.generate_tests()
  end, {
    desc = 'Generate tests for current function'
  })
  
  vim.api.nvim_create_user_command('CodeForgeChat', function()
    M.show_ai_chat()
  end, {
    desc = 'Open AI chat interface'
  })
  
  vim.api.nvim_create_user_command('CodeForge3D', function()
    M.show_3d_view()
  end, {
    desc = 'Open 3D code visualization'
  })
end

-- Task 6: Implement keybinding setup
function M._init_keybindings()
  local opts = { noremap = true, silent = true }
  
  -- Generate code
  vim.keymap.set('n', M.config.keybindings.generate_code, function()
    M.generate_code()
  end, vim.tbl_extend('force', opts, { desc = 'Generate code with AI' }))
  
  -- Explain code
  vim.keymap.set('v', M.config.keybindings.explain_code, function()
    M.explain_selection()
  end, vim.tbl_extend('force', opts, { desc = 'Explain selected code' }))
  
  -- Refactor code
  vim.keymap.set('v', M.config.keybindings.refactor_code, function()
    M.refactor_selection()
  end, vim.tbl_extend('force', opts, { desc = 'Refactor selected code' }))
  
  -- Add tests
  vim.keymap.set('n', M.config.keybindings.add_tests, function()
    M.generate_tests()
  end, vim.tbl_extend('force', opts, { desc = 'Generate tests' }))
  
  -- Toggle 3D view
  vim.keymap.set('n', M.config.keybindings.toggle_3d_view, function()
    M.show_3d_view()
  end, vim.tbl_extend('force', opts, { desc = 'Toggle 3D code view' }))
  
  -- Open chat
  vim.keymap.set('n', M.config.keybindings.open_chat, function()
    M.show_ai_chat()
  end, vim.tbl_extend('force', opts, { desc = 'Open AI chat' }))
  
  -- Command palette
  vim.keymap.set('n', M.config.keybindings.command_palette, function()
    M.show_command_palette()
  end, vim.tbl_extend('force', opts, { desc = 'Open command palette' }))
end

-- Task 7: Add telescope integration
function M._init_telescope_integration()
  local telescope = require('telescope')
  local pickers = require('telescope.pickers')
  local finders = require('telescope.finders')
  local conf = require('telescope.config').values
  local actions = require('telescope.actions')
  local action_state = require('telescope.actions.state')
  
  -- Model picker
  local function model_picker(opts)
    opts = opts or {}
    
    local models = {
      { name = 'GPT-4.1', provider = 'openai', status = 'available' },
      { name = 'Claude 4 Sonnet', provider = 'anthropic', status = 'available' },
      { name = 'Gemini 2.5 Pro', provider = 'google', status = 'available' },
      { name = 'DeepSeek V3-R1', provider = 'deepseek', status = 'available' },
      { name = 'Qwen3-A22B', provider = 'qwen', status = 'available' },
      { name = 'Llama 4 Scout', provider = 'meta', status = 'local' }
    }
    
    pickers.new(opts, {
      prompt_title = 'CodeForge Models',
      finder = finders.new_table {
        results = models,
        entry_maker = function(entry)
          return {
            value = entry,
            display = string.format('%-20s %-12s %s', entry.name, entry.provider, entry.status),
            ordinal = entry.name .. ' ' .. entry.provider
          }
        end
      },
      sorter = conf.generic_sorter(opts),
      attach_mappings = function(prompt_bufnr, map)
        actions.select_default:replace(function()
          actions.close(prompt_bufnr)
          local selection = action_state.get_selected_entry()
          M.switch_model(selection.value)
          print('Switched to model:', selection.value.name)
        end)
        return true
      end
    }):find()
  end
  
  -- Command picker
  local function command_picker(opts)
    opts = opts or {}
    
    local commands = {
      { name = 'Generate Code', command = 'generate_code', desc = 'Generate code using AI' },
      { name = 'Explain Code', command = 'explain_selection', desc = 'Explain selected code' },
      { name = 'Refactor Code', command = 'refactor_selection', desc = 'Refactor selected code' },
      { name = 'Generate Tests', command = 'generate_tests', desc = 'Generate unit tests' },
      { name = 'AI Chat', command = 'show_ai_chat', desc = 'Open AI chat interface' },
      { name = '3D View', command = 'show_3d_view', desc = 'Open 3D code visualization' },
      { name = 'Switch Model', command = 'show_model_picker', desc = 'Switch AI model' },
      { name = 'Performance', command = 'show_performance', desc = 'Show performance metrics' }
    }
    
    pickers.new(opts, {
      prompt_title = 'CodeForge Commands',
      finder = finders.new_table {
        results = commands,
        entry_maker = function(entry)
          return {
            value = entry,
            display = string.format('%-20s %s', entry.name, entry.desc),
            ordinal = entry.name .. ' ' .. entry.desc
          }
        end
      },
      sorter = conf.generic_sorter(opts),
      attach_mappings = function(prompt_bufnr, map)
        actions.select_default:replace(function()
          actions.close(prompt_bufnr)
          local selection = action_state.get_selected_entry()
          M[selection.value.command]()
        end)
        return true
      end
    }):find()
  end
  
  -- Register telescope extensions
  telescope.register_extension {
    exports = {
      models = model_picker,
      commands = command_picker
    }
  }
  
  state.telescope_extension = {
    model_picker = model_picker,
    command_picker = command_picker
  }
end

-- Task 8: Create statusline component
function M._init_statusline()
  -- Create statusline component function
  function M.statusline_component()
    if not state.initialized or not M.config.statusline.enabled then
      return ''
    end
    
    local components = {}
    
    -- Model status
    if M.config.statusline.show_model_status then
      local model_status = state.current_model and state.current_model.name or 'No Model'
      table.insert(components, '🤖 ' .. model_status)
    end
    
    -- Performance metrics
    if M.config.statusline.show_performance then
      local rps = math.floor(state.performance_metrics.requests_per_second)
      local latency = math.floor(state.performance_metrics.average_latency)
      table.insert(components, string.format('⚡ %d req/s %dms', rps, latency))
    end
    
    -- Connection status
    local connection_status = state.lsp_client and '🟢' or '🔴'
    table.insert(components, connection_status .. ' CF')
    
    return table.concat(components, ' │ ')
  end
  
  -- Set up autocommand to update statusline
  vim.api.nvim_create_autocmd({ 'BufEnter', 'CursorMoved' }, {
    pattern = '*',
    callback = function()
      vim.cmd('redrawstatus')
    end
  })
end

-- Core functionality implementations
function M.generate_code(prompt)
  prompt = prompt or vim.fn.input('Describe what you want to generate: ')
  if prompt == '' then
    return
  end
  
  local cursor_pos = vim.api.nvim_win_get_cursor(0)
  local bufnr = vim.api.nvim_get_current_buf()
  
  -- Show loading indicator
  vim.api.nvim_echo({{'Generating code...', 'MoreMsg'}}, false, {})
  
  -- Simulate AI generation (in real implementation, this would call the AI service)
  vim.defer_fn(function()
    local generated_code = {
      '// Generated by CodeForge AI',
      'function ' .. prompt:gsub('%s+', '_'):lower() .. '() {',
      '  // AI-generated implementation',
      '  console.log("' .. prompt .. '");',
      '  return true;',
      '}'
    }
    
    vim.api.nvim_buf_set_lines(bufnr, cursor_pos[1], cursor_pos[1], false, generated_code)
    vim.api.nvim_echo({{'Code generated successfully!', 'MoreMsg'}}, false, {})
  end, 1000)
end

function M.explain_selection()
  local mode = vim.fn.mode()
  if mode ~= 'v' and mode ~= 'V' then
    print('Please select code to explain')
    return
  end
  
  local start_pos = vim.fn.getpos("'<")
  local end_pos = vim.fn.getpos("'>")
  local lines = vim.api.nvim_buf_get_lines(0, start_pos[2] - 1, end_pos[2], false)
  
  if #lines == 0 then
    print('No code selected')
    return
  end
  
  local selected_code = table.concat(lines, '\n')
  
  -- Show explanation in floating window
  local win = M.floating_window.create({
    title = 'Code Explanation',
    width = math.floor(vim.o.columns * 0.6),
    height = math.floor(vim.o.lines * 0.4),
    filetype = 'markdown'
  })
  
  local explanation = {
    '# Code Explanation',
    '',
    '**Selected Code:**',
    '```' .. vim.bo.filetype,
    selected_code,
    '```',
    '',
    '**AI Analysis:**',
    'This code appears to implement...',
    '',
    '**Key Points:**',
    '- Function purpose: ...',
    '- Input parameters: ...',
    '- Return value: ...',
    '- Potential improvements: ...'
  }
  
  vim.api.nvim_buf_set_lines(win.buf, 0, -1, false, explanation)
end

function M.refactor_selection()
  -- Similar to explain_selection but for refactoring
  print('Refactoring code with AI...')
end

function M.generate_tests()
  print('Generating tests with AI...')
end

function M.show_ai_chat()
  M.floating_window.show_ai_chat()
end

function M.show_3d_view()
  M.floating_window.show_3d_view()
end

function M.show_command_palette()
  if state.telescope_extension and state.telescope_extension.command_picker then
    state.telescope_extension.command_picker()
  else
    print('Telescope not available')
  end
end

function M.show_model_picker()
  if state.telescope_extension and state.telescope_extension.model_picker then
    state.telescope_extension.model_picker()
  else
    print('Telescope not available')
  end
end

function M.switch_model(model)
  state.current_model = model
  print('Switched to model:', model.name)
end

function M.show_status()
  local status = {
    'CodeForge Status:',
    '  Initialized: ' .. tostring(state.initialized),
    '  Current Model: ' .. (state.current_model and state.current_model.name or 'None'),
    '  LSP Client: ' .. (state.lsp_client and 'Connected' or 'Disconnected'),
    '  Performance:',
    '    RPS: ' .. state.performance_metrics.requests_per_second,
    '    Latency: ' .. state.performance_metrics.average_latency .. 'ms',
    '    Cache Hit Rate: ' .. state.performance_metrics.cache_hit_rate .. '%'
  }
  
  print(table.concat(status, '\n'))
end

function M.reload()
  state.initialized = false
  print('Reloading CodeForge...')
  M.setup(M.config)
end

-- Background services
function M._start_performance_monitoring()
  -- Update performance metrics periodically
  local timer = vim.loop.new_timer()
  timer:start(0, 1000, vim.schedule_wrap(function()
    -- Update metrics (simulated)
    state.performance_metrics.requests_per_second = math.random(10, 25)
    state.performance_metrics.average_latency = math.random(50, 150)
    state.performance_metrics.cache_hit_rate = math.random(70, 95)
  end))
end

function M._init_model_service()
  -- Initialize connection to CodeForge model service
  state.current_model = {
    name = 'GPT-4.1',
    provider = 'openai',
    status = 'ready'
  }
end

-- Utility functions
function M.get_visual_selection()
  local mode = vim.fn.mode()
  if mode ~= 'v' and mode ~= 'V' then
    return nil
  end
  
  local start_pos = vim.fn.getpos("'<")
  local end_pos = vim.fn.getpos("'>")
  local lines = vim.api.nvim_buf_get_lines(0, start_pos[2] - 1, end_pos[2], false)
  
  return table.concat(lines, '\n')
end

function M.get_current_context()
  local bufnr = vim.api.nvim_get_current_buf()
  local cursor_pos = vim.api.nvim_win_get_cursor(0)
  local lines = vim.api.nvim_buf_get_lines(bufnr, 0, cursor_pos[1], false)
  
  return {
    filetype = vim.bo.filetype,
    filename = vim.api.nvim_buf_get_name(bufnr),
    content = table.concat(lines, '\n'),
    cursor_line = cursor_pos[1],
    cursor_col = cursor_pos[2]
  }
end

-- Auto-completion helpers
function M.get_completion_items(context)
  -- This would integrate with the AI service to get contextual completions
  return {}
end

-- Export the module
return M 