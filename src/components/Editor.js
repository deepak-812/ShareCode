import React, { useState, useEffect, useRef } from 'react';
import Codemirror from 'codemirror';
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/dracula.css';
import 'codemirror/theme/paraiso-dark.css';
import 'codemirror/theme/material-palenight.css';
import 'codemirror/theme/monokai.css';
import 'codemirror/theme/eclipse.css';
import 'codemirror/mode/javascript/javascript';
import 'codemirror/addon/edit/closetag';
import 'codemirror/addon/edit/closebrackets';
import ACTIONS from '../Actions';

const Editor = ({ socketRef, roomId, onCodeChange }) => {
    const editorRef = useRef(null);
    
    // state 
    const [colorTheme,setColorTheme] = useState('dracula');
    
    // efffect
    useEffect(()   => {
       const currentThemeColor = localStorage.getItem('theme-color');
         if(currentThemeColor){
            setColorTheme(currentThemeColor);
         }
    },[])



    useEffect(() => {
        async function init() {
            editorRef.current = Codemirror.fromTextArea(
                document.getElementById('realtimeEditor'),
                {
                    mode: { name: 'javascript', json: true },
                    theme: colorTheme,
                    autoCloseTags: true,
                    autoCloseBrackets: true,
                    lineNumbers: true,
                }
            );

            editorRef.current.on('change', (instance, changes) => {
                const { origin } = changes;
                const code = instance.getValue();
                onCodeChange(code);
                if (origin !== 'setValue') {
                    socketRef.current.emit(ACTIONS.CODE_CHANGE, {
                        roomId,
                        code,
                    });
                }
            });
        }
        init();
    }, []);


    const handleClick = (editorTheme) => {
        editorRef.current.setOption("theme",editorTheme);
        setColorTheme(editorTheme);
        localStorage.setItem('theme-color',editorTheme);
     }

    useEffect(() => {
        if (socketRef.current) {
            socketRef.current.on(ACTIONS.CODE_CHANGE, ({ code }) => {
                if (code !== null) {
                    editorRef.current.setValue(code);
                }
            });
        }

        return () => {
            socketRef.current.off(ACTIONS.CODE_CHANGE);
        };
    }, [socketRef.current]);

    return (
        <>
          <div className="editor_section"> 
            <div className='right-section'>
                <div className="doubleTap-header"><h3>Theme Switcher &nbsp;</h3></div>
                <div className="theme-section">
                    <div className={`${colorTheme === 'dracula' ? 'active' : ''}`} id='th1' 
                    onClick={() => handleClick('dracula')}
                    ></div>
                    <div className={`${colorTheme === 'paraiso-dark' ? 'active' : ''}`} id="th2" 
                    onClick={() => handleClick('paraiso-dark')}
                    ></div>
                    <div className={`${colorTheme === 'material-palenight' ? 'active' : ''}`} id="th3"
                    onClick={() => handleClick('material-palenight')}
                    ></div>
                    <div className={`${colorTheme === 'monokai' ? 'active' : ''}`} id="th4"
                    onClick={() => handleClick('monokai')}
                    ></div>
                    <div className={`${colorTheme === 'eclipse' ? 'active' : ''}`} id="th5"
                    onClick={() => handleClick('eclipse')}
                    ></div>
                </div>
            </div>
            <textarea id="realtimeEditor"></textarea>
          </div>
        </>
    )
};

export default Editor;
