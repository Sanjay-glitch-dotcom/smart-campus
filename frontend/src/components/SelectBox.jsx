import React, { useState, useRef, useEffect } from 'react';

export default function SelectBox({
    label,
    name,
    value,
    onChange,
    options   = [],
    placeholder = '-- Select --',
    required  = false,
    disabled  = false,
    error     = ''
}) {
    const [open, setOpen]         = useState(false);
    const [isDark, setIsDark]     = useState(false);
    const containerRef            = useRef(null);

    // Detect current theme
    useEffect(() => {
        const checkTheme = () => {
            const theme = document.documentElement
                .getAttribute('data-theme');
            setIsDark(theme === 'dark');
        };
        checkTheme();

        // Watch for theme changes
        const observer = new MutationObserver(checkTheme);
        observer.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['data-theme']
        });
        return () => observer.disconnect();
    }, []);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current &&
                !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () =>
            document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const selected = options.find(opt => opt.value === value);

    const handleSelect = (optValue) => {
        // Mimic a real onChange event so existing handleChange works
        onChange({ target: { name, value: optValue } });
        setOpen(false);
    };

    const t = isDark ? dark : light;

    return (
        <div style={styles.wrapper}>

            {/* Label */}
            {label && (
                <label style={{ ...styles.label, color: t.text }}>
                    {label}
                    {required &&
                        <span style={{ color: '#e53935' }}> *</span>}
                </label>
            )}

            {/* Trigger Button */}
            <div
                ref={containerRef}
                style={{ position: 'relative' }}
            >
                <button
                    type="button"
                    onClick={() => !disabled && setOpen(prev => !prev)}
                    style={{
                        ...styles.trigger,
                        background:  t.inputBg,
                        color:       selected ? t.text : t.placeholder,
                        border:      error
                            ? '1px solid #e53935'
                            : `1px solid ${t.border}`,
                        cursor:      disabled ? 'not-allowed' : 'pointer',
                        opacity:     disabled ? 0.6 : 1
                    }}
                >
                    <span>
                        {selected ? selected.label : placeholder}
                    </span>
                    <span style={{
                        ...styles.arrow,
                        transform: open
                            ? 'rotate(180deg)'
                            : 'rotate(0deg)'
                    }}>
                        ▾
                    </span>
                </button>

                {/* Dropdown List */}
                {open && (
                    <ul style={{
                        ...styles.dropdown,
                        background:  t.inputBg,
                        border:      `1px solid ${t.border}`,
                        boxShadow:   t.shadow
                    }}>
                        {options.map(opt => {
                            const isSelected = opt.value === value;
                            return (
                                <li
                                    key={opt.value}
                                    onClick={() =>
                                        !opt.disabled &&
                                        handleSelect(opt.value)}
                                    style={{
                                        ...styles.option,
                                        background: isSelected
                                            ? t.selectedBg
                                            : 'transparent',
                                        color: isSelected
                                            ? t.selectedText
                                            : opt.disabled
                                                ? t.placeholder
                                                : t.text,
                                        cursor: opt.disabled
                                            ? 'not-allowed'
                                            : 'pointer'
                                    }}
                                    onMouseEnter={e => {
                                        if (!isSelected && !opt.disabled) {
                                            e.currentTarget.style.background
                                                = t.hoverBg;
                                        }
                                    }}
                                    onMouseLeave={e => {
                                        if (!isSelected) {
                                            e.currentTarget.style.background
                                                = 'transparent';
                                        }
                                    }}
                                >
                                    {opt.label}
                                </li>
                            );
                        })}
                    </ul>
                )}
            </div>

            {/* Error */}
            {error && (
                <span style={styles.errorText}>{error}</span>
            )}
        </div>
    );
}

// ── Theme tokens ─────────────────────────────────────
const light = {
    text:         '#1a1a2e',
    placeholder:  '#999999',
    inputBg:      '#ffffff',
    border:       '#e0e0e0',
    hoverBg:      '#f0f2f5',
    selectedBg:   '#1a73e8',
    selectedText: '#ffffff',
    shadow:       '0 4px 12px rgba(0,0,0,0.1)'
};

const dark = {
    text:         '#e0e0e0',
    placeholder:  '#666666',
    inputBg:      '#2a2a3e',
    border:       '#2e2e4e',
    hoverBg:      '#3a3a5e',
    selectedBg:   '#1a73e8',
    selectedText: '#ffffff',
    shadow:       '0 4px 12px rgba(0,0,0,0.4)'
};

// ── Styles ───────────────────────────────────────────
const styles = {
    wrapper: {
        display:       'flex',
        flexDirection: 'column',
        gap:           '6px',
        marginBottom:  '18px'
    },
    label: {
        fontSize:   '14px',
        fontWeight: '600'
    },
    trigger: {
        width:          '100%',
        padding:        '10px 12px',
        borderRadius:   '6px',
        fontSize:       '14px',
        display:        'flex',
        justifyContent: 'space-between',
        alignItems:     'center',
        outline:        'none',
        boxSizing:      'border-box',
        transition:     'border-color 0.2s'
    },
    arrow: {
        fontSize:   '12px',
        transition: 'transform 0.2s ease',
        marginLeft: '8px'
    },
    dropdown: {
        position:     'absolute',
        top:          'calc(100% + 4px)',
        left:         0,
        right:        0,
        borderRadius: '6px',
        listStyle:    'none',
        margin:       0,
        padding:      '4px 0',
        zIndex:       1000,
        maxHeight:    '220px',
        overflowY:    'auto'
    },
    option: {
        padding:    '10px 14px',
        fontSize:   '14px',
        transition: 'background 0.15s',
        userSelect: 'none'
    },
    errorText: {
        fontSize: '12px',
        color:    '#e53935'
    }
};