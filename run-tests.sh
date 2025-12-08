#!/usr/bin/env bash

# 测试运行脚本
# 用法: ./run-tests.sh [options]

set -e

# 颜色输出
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🧪 XQLightweight 测试套件${NC}\n"

# 解析命令行参数
MODE="all"
WATCH=false

while [[ $# -gt 0 ]]; do
    case $1 in
        --watch|-w)
            WATCH=true
            shift
            ;;
        --unit|-u)
            MODE="unit"
            shift
            ;;
        --integration|-i)
            MODE="integration"
            shift
            ;;
        --coverage|-c)
            MODE="coverage"
            shift
            ;;
        --help|-h)
            echo "用法: $0 [options]"
            echo ""
            echo "选项:"
            echo "  -w, --watch         监视模式"
            echo "  -u, --unit          只运行单元测试"
            echo "  -i, --integration   只运行集成测试"
            echo "  -c, --coverage      生成覆盖率报告"
            echo "  -h, --help          显示帮助"
            exit 0
            ;;
        *)
            echo -e "${RED}未知选项: $1${NC}"
            exit 1
            ;;
    esac
done

# 检查依赖
if ! command -v bun &> /dev/null; then
    echo -e "${RED}错误: 未找到 bun${NC}"
    echo "请先安装 bun: https://bun.sh"
    exit 1
fi

# 运行测试
case $MODE in
    "all")
        echo -e "${YELLOW}运行所有测试...${NC}\n"
        if [ "$WATCH" = true ]; then
            bun test --watch
        else
            bun test
        fi
        ;;
    "unit")
        echo -e "${YELLOW}运行单元测试...${NC}\n"
        if [ "$WATCH" = true ]; then
            bun test --watch "src/**/__tests__/**/*.test.ts"
        else
            bun test "src/**/__tests__/**/*.test.ts"
        fi
        ;;
    "integration")
        echo -e "${YELLOW}运行集成测试...${NC}\n"
        if [ "$WATCH" = true ]; then
            bun test --watch "src/__tests__/integration/**/*.test.ts"
        else
            bun test "src/__tests__/integration/**/*.test.ts"
        fi
        ;;
    "coverage")
        echo -e "${YELLOW}生成覆盖率报告...${NC}\n"
        bun test --coverage
        echo -e "\n${GREEN}覆盖率报告已生成${NC}"
        ;;
esac

# 显示结果
if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✅ 测试通过！${NC}"
    exit 0
else
    echo -e "\n${RED}❌ 测试失败${NC}"
    exit 1
fi
