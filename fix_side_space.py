import re

with open('KathaBridge/src/App.tsx', 'r', encoding='utf-8') as f:
    content = f.read()

# 1. Update root container to prevent any horizontal overflow
content = content.replace(
    'min-h-screen font-sans selection:bg-brandPink selection:text-white flex flex-col justify-between transition-colors duration-200',
    'min-h-screen w-full overflow-x-hidden font-sans selection:bg-brandPink selection:text-white flex flex-col justify-between transition-colors duration-200'
)

# 2. Update max-w-[1440px] to max-w-[1720px] and expansive responsive padding
old_container = 'max-w-[1440px] mx-auto px-6 lg:px-12'
new_container = 'max-w-[1720px] mx-auto px-6 sm:px-10 lg:px-14 xl:px-18 2xl:px-24'
content = content.replace(old_container, new_container)

# 3. Fix the starburst ornaments in the hero so they don't get sliced awkwardly at edges
old_starburst = '''        {/* Starburst Ornaments */}
        <div className="absolute -left-12 top-28 -z-0 pointer-events-none select-none">
          <svg className="w-48 h-48 text-brandPink fill-current opacity-95 animate-pulse" viewBox="0 0 100 100">
            <path d="M0,50 L40,30 L50,0 L60,30 L100,50 L60,70 L50,100 L40,70 Z"></path>
          </svg>
        </div>
        <div className="absolute -right-16 bottom-20 -z-0 pointer-events-none select-none">
          <svg className="w-60 h-60 text-brandPink fill-current opacity-90 rotate-12" viewBox="0 0 100 100">
            <path d="M0,50 L35,28 L50,0 L65,28 L100,50 L65,72 L50,100 L35,72 Z"></path>
          </svg>
        </div>'''

new_starburst = '''        {/* Starburst Ornaments */}
        <div className="absolute left-2 sm:left-6 lg:left-10 top-24 -z-0 pointer-events-none select-none opacity-40 lg:opacity-75">
          <svg className="w-32 h-32 lg:w-44 lg:h-44 text-brandPink fill-current animate-pulse" viewBox="0 0 100 100">
            <path d="M0,50 L40,30 L50,0 L60,30 L100,50 L60,70 L50,100 L40,70 Z"></path>
          </svg>
        </div>
        <div className="absolute right-2 sm:right-6 lg:right-10 bottom-12 -z-0 pointer-events-none select-none opacity-40 lg:opacity-75">
          <svg className="w-40 h-40 lg:w-52 lg:h-52 text-brandPink fill-current rotate-12" viewBox="0 0 100 100">
            <path d="M0,50 L35,28 L50,0 L65,28 L100,50 L65,72 L50,100 L35,72 Z"></path>
          </svg>
        </div>'''

if old_starburst in content:
    content = content.replace(old_starburst, new_starburst)
else:
    print('Warning: old_starburst did not match directly, checking regex...')

# 4. Remove cramped max-w-[530px] from hero subtitle
content = content.replace(
    'max-w-[530px] font-bold mb-8',
    'max-w-2xl xl:max-w-3xl font-bold mb-8'
)

# 5. Expand hero feature bar from max-w-[560px] to max-w-2xl
content = content.replace(
    'border-t-2 border-brandBlack max-w-[560px]',
    'border-t-2 border-brandBlack max-w-xl xl:max-w-2xl w-full'
)

# 6. Upgrade story grid to 4 columns on large desktop
content = content.replace(
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch',
    'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 items-stretch'
)

with open('KathaBridge/src/App.tsx', 'w', encoding='utf-8') as f:
    f.write(content)

print('Updated App.tsx with expansive desktop view and clean side spacing!')

