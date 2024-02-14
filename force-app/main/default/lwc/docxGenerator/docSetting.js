export function getNumbering(docx) {
    return {
        config: [
            {
                reference: "numbering-style-1",
                levels: [
                    {
                        level: 0,
                        format: "decimal",
                        text: "%1.", // results in '1.', '2.', etc.
                        alignment: docx.AlignmentType.START,
                        style: {
                            paragraph: {
                                indent: { left: 720, hanging: 260 }
                            }
                        }
                    },
                    {
                        level: 1,
                        format: "lowerLetter",
                        text: "%2.", // results in 'a.', 'b.', etc.
                        alignment: docx.AlignmentType.START,
                        style: {
                            paragraph: {
                                // Increase indentation for nested levels
                                indent: { left: 1440, hanging: 260 }
                            }
                        }
                    },
                    {
                        level: 2,
                        format: "lowerRoman",
                        text: "%3.", // results in 'a.', 'b.', etc.
                        alignment: docx.AlignmentType.START,
                        style: {
                            paragraph: {
                                // Increase indentation for nested levels
                                indent: { left: 2160, hanging: 260 }
                            }
                        }
                    },
                    {
                        level: 3,
                        format: "decimal",
                        text: "%4.", // results in 'a.', 'b.', etc.
                        alignment: docx.AlignmentType.START,
                        style: {
                            paragraph: {
                                // Increase indentation for nested levels
                                indent: { left: 2880, hanging: 260 }
                            }
                        }
                    },
                    {
                        level: 4,
                        format: "lowerLetter",
                        text: "%5.", // results in 'a.', 'b.', etc.
                        alignment: docx.AlignmentType.START,
                        style: {
                            paragraph: {
                                // Increase indentation for nested levels
                                indent: { left: 3600, hanging: 260 }
                            }
                        }
                    },
                    {
                        level: 5,
                        format: "lowerRoman",
                        text: "%6.", // results in 'a.', 'b.', etc.
                        alignment: docx.AlignmentType.START,
                        style: {
                            paragraph: {
                                // Increase indentation for nested levels
                                indent: { left: 4320, hanging: 260 }
                            }
                        }
                    },
                    {
                        level: 6,
                        format: "decimal",
                        text: "%7.", // results in 'a.', 'b.', etc.
                        alignment: docx.AlignmentType.START,
                        style: {
                            paragraph: {
                                // Increase indentation for nested levels
                                indent: { left: 5040, hanging: 260 }
                            }
                        }
                    },
                    {
                        level: 7,
                        format: "lowerLetter",
                        text: "%8.", // results in 'a.', 'b.', etc.
                        alignment: docx.AlignmentType.START,
                        style: {
                            paragraph: {
                                // Increase indentation for nested levels
                                indent: { left: 5760, hanging: 260 }
                            }
                        }
                    },
                    {
                        level: 8,
                        format: "lowerRoman",
                        text: "%9.", // results in 'a.', 'b.', etc.
                        alignment: docx.AlignmentType.START,
                        style: {
                            paragraph: {
                                // Increase indentation for nested levels
                                indent: { left: 6480, hanging: 260 }
                            }
                        }
                    }
                ]
            }
        ]
    };
}