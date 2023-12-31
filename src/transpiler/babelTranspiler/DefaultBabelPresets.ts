export const defaultBabelPresets = (modules) => {
    return {
        presets: [
            [
                require.resolve('@babel/preset-env'),
                {
                    targets: {
                        browsers: [
                            '>1%',
                            'last 2 chrome versions',
                            'last 2 edge versions',
                            'last 2 firefox versions',
                            'last 2 safari versions',
                            'not dead',
                            'not ie <= 11',
                            'not op_mini all',
                            'not android <= 4.4',
                            'not samsung <= 4',
                        ],
                        node: '16',
                    },
                    useBuiltIns: false,
                    modules,
                },
            ],
            require.resolve('@babel/preset-react'),
            require.resolve('@babel/preset-typescript'),
        ],
    }
}
