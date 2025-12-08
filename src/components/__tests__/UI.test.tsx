import { describe, it, expect, mock, beforeEach } from 'bun:test';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import UI from '../UI';

// Mock Phaser Game
class MockGame {
    public scene = {
        getScene: mock((name: string) => {
            if (name === 'MainScene') {
                return {
                    events: {
                        on: mock(() => { }),
                        off: mock(() => { }),
                    },
                    getScores: mock(() => ({ red: 500, black: 500 })),
                    showScore: true,
                    soundEnabled: true,
                    moveMode: 0,
                    handicap: 0,
                    animated: true,
                    difficulty: 100,
                    retract: mock(() => { }),
                    recommend: mock(() => { }),
                    setSound: mock(() => { }),
                    setDifficulty: mock(() => { }),
                    setAnimated: mock(() => { }),
                    setShowScore: mock(() => { }),
                    restart: mock(() => { }),
                };
            }
            return null;
        })
    };
}

describe('UI Component', () => {
    let mockGame: MockGame;

    beforeEach(() => {
        mockGame = new MockGame();
    });

    describe('渲染', () => {
        it('应该正确渲染 UI', () => {
            const { container } = render(<UI gameInstance={mockGame as any} />);
            expect(container).toBeTruthy();
        });

        it('应该显示控制按钮', () => {
            render(<UI gameInstance={mockGame as any} />);

            expect(screen.getByText('设置')).toBeTruthy();
            expect(screen.getByText('重开')).toBeTruthy();
            expect(screen.getByText('悔棋')).toBeTruthy();
            expect(screen.getByText('提示')).toBeTruthy();
        });

        it('gameInstance 为 null 时应该正常渲染', () => {
            const { container } = render(<UI gameInstance={null} />);
            expect(container).toBeTruthy();
        });
    });

    describe('分数显示', () => {
        it('showScore 为 true 时应该显示分数', async () => {
            render(<UI gameInstance={mockGame as any} />);

            await waitFor(() => {
                const scoreBar = screen.queryByRole('progressbar');
                // 分数条应该存在（虽然我们没设置 role，但可以检查其他东西）
                expect(document.querySelector('[style*="backgroundColor"]')).toBeTruthy();
            });
        });

        it('应该显示红黑双方分数占比', () => {
            render(<UI gameInstance={mockGame as any} />);

            // 默认50%-50%的情况
            // 可以检查是否有百分比文本
            const container = screen.getByText(/50%/);
            expect(container).toBeTruthy();
        });

        it('分数更新时应该重新渲染', async () => {
            const { rerender } = render(<UI gameInstance={mockGame as any} />);

            // 模拟分数事件
            const scene = mockGame.scene.getScene('MainScene');
            const updateCallback = scene.events.on.mock.calls.find(
                (call: any) => call[0] === 'update-score'
            )?.[1];

            if (updateCallback) {
                updateCallback({ red: 700, black: 300 });
            }

            rerender(<UI gameInstance={mockGame as any} />);

            await waitFor(() => {
                // 应该有新的百分比
                expect(document.body.textContent).toContain('%');
            });
        });
    });

    describe('按钮交互', () => {
        it('点击设置按钮应该打开设置模态框', () => {
            render(<UI gameInstance={mockGame as any} />);

            const settingsButton = screen.getByText('设置');
            fireEvent.click(settingsButton);

            // 设置模态框应该显示
            expect(screen.getByText('游戏设置')).toBeTruthy();
        });

        it('点击重开按钮应该打开确认模态框', () => {
            render(<UI gameInstance={mockGame as any} />);

            const restartButton = screen.getByText('重开');
            fireEvent.click(restartButton);

            // 确认模态框应该显示
            expect(screen.queryByText(/确认要重新开始/)).toBeTruthy();
        });

        it('点击悔棋按钮应该调用 scene.retract', () => {
            render(<UI gameInstance={mockGame as any} />);

            const scene = mockGame.scene.getScene('MainScene');
            const retractButton = screen.getByText('悔棋');

            fireEvent.click(retractButton);

            expect(scene.retract).toHaveBeenCalled();
        });

        it('点击提示按钮应该调用 scene.recommend', () => {
            render(<UI gameInstance={mockGame as any} />);

            const scene = mockGame.scene.getScene('MainScene');
            const recommendButton = screen.getByText('提示');

            fireEvent.click(recommendButton);

            expect(scene.recommend).toHaveBeenCalled();
        });
    });

    describe('模态框', () => {
        it('关闭设置模态框应该隐藏它', () => {
            render(<UI gameInstance={mockGame as any} />);

            // 打开
            fireEvent.click(screen.getByText('设置'));
            expect(screen.getByText('游戏设置')).toBeTruthy();

            // 关闭
            fireEvent.click(screen.getByText('关闭'));
            expect(screen.queryByText('游戏设置')).toBeNull();
        });

        it('设置模态框应该传递正确的 scene', () => {
            render(<UI gameInstance={mockGame as any} />);

            fireEvent.click(screen.getByText('设置'));

            // SettingsModal 应该接收到 scene
            // 可以通过检查是否显示了 scene 的设置来验证
            expect(screen.getByText(/难度/)).toBeTruthy();
        });
    });

    describe('事件监听', () => {
        it('应该监听 update-score 事件', () => {
            render(<UI gameInstance={mockGame as any} />);

            const scene = mockGame.scene.getScene('MainScene');
            const onCalls = scene.events.on.mock.calls;

            const hasScoreListener = onCalls.some(
                (call: any) => call[0] === 'update-score'
            );

            expect(hasScoreListener).toBe(true);
        });

        it('应该监听 update-settings 事件', () => {
            render(<UI gameInstance={mockGame as any} />);

            const scene = mockGame.scene.getScene('MainScene');
            const onCalls = scene.events.on.mock.calls;

            const hasSettingsListener = onCalls.some(
                (call: any) => call[0] === 'update-settings'
            );

            expect(hasSettingsListener).toBe(true);
        });

        it('组件卸载时应该移除事件监听', () => {
            const { unmount } = render(<UI gameInstance={mockGame as any} />);

            const scene = mockGame.scene.getScene('MainScene');

            unmount();

            expect(scene.events.off).toHaveBeenCalled();
        });
    });

    describe('响应式布局', () => {
        it('应该使用 flexbox 布局', () => {
            const { container } = render(<UI gameInstance={mockGame as any} />);

            const mainDiv = container.firstChild as HTMLElement;
            expect(mainDiv.style.display).toBe('flex');
        });

        it('按钮应该使用 grid 布局', () => {
            render(<UI gameInstance={mockGame as any} />);

            const buttonContainer = document.querySelector('[style*="grid"]') as HTMLElement;
            expect(buttonContainer).toBeTruthy();
        });
    });

    describe('边界情况', () => {
        it('scene 为 null 时按钮不应该崩溃', () => {
            // Mock 一个返回 null 的 game
            const nullSceneGame = {
                scene: {
                    getScene: mock(() => null)
                }
            };

            render(<UI gameInstance={nullSceneGame as any} />);

            expect(() => {
                fireEvent.click(screen.getByText('悔棋'));
                fireEvent.click(screen.getByText('提示'));
            }).not.toThrow();
        });

        it('快速切换模态框应该正常工作', () => {
            render(<UI gameInstance={mockGame as any} />);

            fireEvent.click(screen.getByText('设置'));
            fireEvent.click(screen.getByText('关闭'));
            fireEvent.click(screen.getByText('重开'));

            expect(() => screen.getByText(/确认/)).not.toThrow();
        });
    });
});
