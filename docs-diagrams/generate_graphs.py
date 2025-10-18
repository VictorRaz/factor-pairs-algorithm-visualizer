import matplotlib.pyplot as plt
import numpy as np

# Set style
plt.style.use('seaborn-v0_8-darkgrid')

# 1. Time Complexity Comparison Graph
fig, ax = plt.subplots(figsize=(12, 8))

n_values = np.linspace(1, 1000, 1000)
brute_force = n_values ** 2
linear = n_values
sqrt_n = np.sqrt(n_values)

ax.plot(n_values, brute_force, label='Brute Force O(n²)', linewidth=3, color='#d32f2f')
ax.plot(n_values, linear, label='Single Loop O(n)', linewidth=3, color='#f57c00')
ax.plot(n_values, sqrt_n, label='Optimized O(√n)', linewidth=3, color='#388e3c')

ax.set_xlabel('Input Size (n)', fontsize=14, fontweight='bold')
ax.set_ylabel('Number of Operations', fontsize=14, fontweight='bold')
ax.set_title('Algorithm Performance Comparison:\nHow Operations Grow with Input Size', 
             fontsize=16, fontweight='bold', pad=20)
ax.legend(fontsize=12, loc='upper left')
ax.grid(True, alpha=0.3)
ax.set_xlim(0, 1000)
ax.set_ylim(0, 50000)

# Add annotations
ax.annotate('O(√n): Most Efficient', xy=(900, np.sqrt(900)), xytext=(700, 5000),
            arrowprops=dict(arrowstyle='->', color='#388e3c', lw=2),
            fontsize=11, color='#388e3c', fontweight='bold')
ax.annotate('O(n): Moderate', xy=(900, 900), xytext=(600, 15000),
            arrowprops=dict(arrowstyle='->', color='#f57c00', lw=2),
            fontsize=11, color='#f57c00', fontweight='bold')
ax.annotate('O(n²): Slowest', xy=(700, 700**2), xytext=(400, 40000),
            arrowprops=dict(arrowstyle='->', color='#d32f2f', lw=2),
            fontsize=11, color='#d32f2f', fontweight='bold')

plt.tight_layout()
plt.savefig('/home/ubuntu/factor-pairs-project/diagrams/complexity_comparison.png', dpi=300, bbox_inches='tight')
plt.close()

# 2. Logarithmic Scale Comparison
fig, ax = plt.subplots(figsize=(12, 8))

n_values_log = np.logspace(0, 6, 100)  # 1 to 1,000,000
brute_force_log = n_values_log ** 2
linear_log = n_values_log
sqrt_n_log = np.sqrt(n_values_log)

ax.loglog(n_values_log, brute_force_log, label='Brute Force O(n²)', linewidth=3, color='#d32f2f')
ax.loglog(n_values_log, linear_log, label='Single Loop O(n)', linewidth=3, color='#f57c00')
ax.loglog(n_values_log, sqrt_n_log, label='Optimized O(√n)', linewidth=3, color='#388e3c')

ax.set_xlabel('Input Size (n) - Log Scale', fontsize=14, fontweight='bold')
ax.set_ylabel('Number of Operations - Log Scale', fontsize=14, fontweight='bold')
ax.set_title('Algorithm Scalability: Logarithmic View\nHow Each Algorithm Handles Large Numbers', 
             fontsize=16, fontweight='bold', pad=20)
ax.legend(fontsize=12, loc='upper left')
ax.grid(True, alpha=0.3, which='both')

plt.tight_layout()
plt.savefig('/home/ubuntu/factor-pairs-project/diagrams/complexity_log_scale.png', dpi=300, bbox_inches='tight')
plt.close()

# 3. Execution Time Bar Chart
fig, ax = plt.subplots(figsize=(12, 8))

test_cases = ['n = 100', 'n = 10,000', 'n = 1,000,000']
brute_ops = [10000, 100000000, 1000000000000]
linear_ops = [100, 10000, 1000000]
sqrt_ops = [10, 100, 1000]

x = np.arange(len(test_cases))
width = 0.25

bars1 = ax.bar(x - width, brute_ops, width, label='Brute Force O(n²)', color='#d32f2f', alpha=0.8)
bars2 = ax.bar(x, linear_ops, width, label='Single Loop O(n)', color='#f57c00', alpha=0.8)
bars3 = ax.bar(x + width, sqrt_ops, width, label='Optimized O(√n)', color='#388e3c', alpha=0.8)

ax.set_ylabel('Number of Operations (log scale)', fontsize=14, fontweight='bold')
ax.set_xlabel('Test Case', fontsize=14, fontweight='bold')
ax.set_title('Real-World Performance Comparison\nOperations Required for Different Input Sizes', 
             fontsize=16, fontweight='bold', pad=20)
ax.set_xticks(x)
ax.set_xticklabels(test_cases, fontsize=12)
ax.legend(fontsize=11)
ax.set_yscale('log')
ax.grid(True, alpha=0.3, axis='y')

# Add value labels on bars
def add_value_labels(bars):
    for bar in bars:
        height = bar.get_height()
        ax.text(bar.get_x() + bar.get_width()/2., height,
                f'{height:,.0f}',
                ha='center', va='bottom', fontsize=9, rotation=0)

plt.tight_layout()
plt.savefig('/home/ubuntu/factor-pairs-project/diagrams/operations_comparison.png', dpi=300, bbox_inches='tight')
plt.close()

# 4. Factor Pairs Visualization for n=36
fig, ax = plt.subplots(figsize=(12, 8))

factors_small = [1, 2, 3, 4, 6]
factors_large = [36, 18, 12, 9, 6]
sqrt_line = 6

# Create scatter plot
ax.scatter(factors_small, factors_large, s=300, c='#1976d2', alpha=0.7, edgecolors='black', linewidth=2, zorder=3)

# Add lines connecting pairs
for i in range(len(factors_small)):
    ax.plot([factors_small[i], factors_small[i]], [0, factors_large[i]], 
            'k--', alpha=0.3, linewidth=1)
    ax.plot([0, factors_small[i]], [factors_large[i], factors_large[i]], 
            'k--', alpha=0.3, linewidth=1)
    
    # Add product labels
    ax.text(factors_small[i], factors_large[i] + 1.5, 
            f'{factors_small[i]} × {factors_large[i]} = 36',
            ha='center', fontsize=10, fontweight='bold')

# Add square root line
ax.axhline(y=sqrt_line, color='#d32f2f', linestyle='-', linewidth=3, label='√36 = 6', zorder=2)
ax.axvline(x=sqrt_line, color='#d32f2f', linestyle='-', linewidth=3, zorder=2)

# Shade regions
ax.fill_between([0, sqrt_line], 0, sqrt_line, alpha=0.1, color='green', label='Search Region (≤√n)')
ax.fill_between([sqrt_line, 40], sqrt_line, 40, alpha=0.1, color='red', label='Skip Region (>√n)')

ax.set_xlabel('Small Factor (i)', fontsize=14, fontweight='bold')
ax.set_ylabel('Large Factor (j)', fontsize=14, fontweight='bold')
ax.set_title('Factor Pairs Symmetry Around √n\nExample: n = 36', 
             fontsize=16, fontweight='bold', pad=20)
ax.legend(fontsize=12, loc='upper right')
ax.grid(True, alpha=0.3)
ax.set_xlim(0, 40)
ax.set_ylim(0, 40)
ax.set_aspect('equal')

plt.tight_layout()
plt.savefig('/home/ubuntu/factor-pairs-project/diagrams/factor_pairs_visual.png', dpi=300, bbox_inches='tight')
plt.close()

# 5. Speedup Comparison
fig, ax = plt.subplots(figsize=(12, 8))

n_values_speedup = [100, 1000, 10000, 100000, 1000000]
speedup_linear = [100, 1000, 10000, 100000, 1000000]  # n/1
speedup_sqrt = [1000, 31623, 1000000, 31622777, 1000000000]  # n²/√n

ax.plot(n_values_speedup, speedup_linear, marker='o', markersize=10, 
        linewidth=3, color='#f57c00', label='O(n) vs O(n²) Speedup')
ax.plot(n_values_speedup, speedup_sqrt, marker='s', markersize=10, 
        linewidth=3, color='#388e3c', label='O(√n) vs O(n²) Speedup')

ax.set_xlabel('Input Size (n)', fontsize=14, fontweight='bold')
ax.set_ylabel('Speedup Factor (times faster)', fontsize=14, fontweight='bold')
ax.set_title('How Much Faster Are Optimized Algorithms?\nSpeedup Compared to Brute Force', 
             fontsize=16, fontweight='bold', pad=20)
ax.legend(fontsize=12, loc='upper left')
ax.set_xscale('log')
ax.set_yscale('log')
ax.grid(True, alpha=0.3, which='both')

# Add annotations
for i, n in enumerate(n_values_speedup):
    if i % 2 == 0:  # Annotate every other point
        ax.annotate(f'{speedup_sqrt[i]:,.0f}×', 
                   xy=(n, speedup_sqrt[i]), 
                   xytext=(10, 10), 
                   textcoords='offset points',
                   fontsize=10, 
                   color='#388e3c',
                   fontweight='bold')

plt.tight_layout()
plt.savefig('/home/ubuntu/factor-pairs-project/diagrams/speedup_comparison.png', dpi=300, bbox_inches='tight')
plt.close()

print("All graphs generated successfully!")
