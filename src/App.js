import React, { useRef, useState, useEffect } from 'react'
import Moveable from 'react-moveable'

const App = () => {
  const [moveableComponents, setMoveableComponents] = useState([])
  const [selected, setSelected] = useState(null)
  const [isDelDisabled, setIsDelDisabled] = useState(true)

  useEffect(() => {
    if (!!selected) {
      setIsDelDisabled(false)
    } else {
      setIsDelDisabled(true)
    }

    if (moveableComponents.length === 0) {
      setIsDelDisabled(true)
    }
  }, [moveableComponents, selected])

  useEffect(() => {
    const fetchData = async () => {
      const data = await fetch('https://jsonplaceholder.typicode.com/photos');
      const json = await data.json();
      // console.log(json)
    }
  
    fetchData()
      .catch(console.error);
  }, [])

  const addMoveable = () => {
    // Create a new moveable component and add it to the array
    const COLORS = ['red', 'blue', 'yellow', 'green', 'purple']

    setMoveableComponents([
      ...moveableComponents,
      {
        id: Math.floor(Math.random() * Date.now()),
        top: 0,
        left: 0,
        width: 100,
        height: 100,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        updateEnd: true
      }
    ])
  }

  const deleteMoveable = () => {
    const newMovCom = moveableComponents.filter((item) => item.id !== selected)
    setMoveableComponents(newMovCom)
    setSelected(null)
  }

  const updateMoveable = (id, newComponent, updateEnd = false) => {
    const updatedMoveables = moveableComponents.map((moveable, i) => {
      if (moveable.id === id) {
        if (
          newComponent.left > 0 &&
          newComponent.left < newComponent.parentBounds.width - newComponent.width &&
          newComponent.top > 0 &&
          newComponent.top < newComponent.parentBounds.height - newComponent.height
        ) {
          return { id, ...newComponent, updateEnd }
        }
      }
      return moveable
    })
    setMoveableComponents(updatedMoveables)
  }

  const handleResizeStart = (index, e) => {
    console.log('e', e.direction)
    // Check if the resize is coming from the left handle
    const [handlePosX, handlePosY] = e.direction
    // 0 => center
    // -1 => top or left
    // 1 => bottom or right

    // -1, -1
    // -1, 0
    // -1, 1
    if (handlePosX === -1) {
      console.log('width', moveableComponents, e)
      // Save the initial left and width values of the moveable component
      const initialLeft = e.left
      const initialWidth = e.width

      // Set up the onResize event handler to update the left value based on the change in width
    }
  }

  return (
    <main style={{ height: '100vh', width: '100vw' }}>
      <button onClick={addMoveable}>Add Moveable1</button>
      <button disabled={isDelDisabled} onClick={deleteMoveable}>
        Delete Moveable
      </button>
      <div
        id='parent'
        style={{
          position: 'relative',
          background: 'black',
          height: '80vh',
          width: '80vw'
        }}
      >
        {moveableComponents.map((item, index) => (
          <Component
            {...item}
            key={index}
            updateMoveable={updateMoveable}
            handleResizeStart={handleResizeStart}
            setSelected={setSelected}
            isSelected={selected === item.id}
          />
        ))}
      </div>
    </main>
  )
}

export default App

const Component = ({
  updateMoveable,
  top,
  left,
  width,
  height,
  index,
  color,
  id,
  setSelected,
  isSelected = false,
  updateEnd
}) => {
  const ref = useRef()

  const [nodoReferencia, setNodoReferencia] = useState({
    top,
    left,
    width,
    height,
    index,
    color,
    id
  })

  let parent = document.getElementById('parent')
  let parentBounds = parent?.getBoundingClientRect() // get parent position

  const onResize = async (e) => {
    // ACTUALIZAR ALTO Y ANCHO
    let newWidth = e.width
    let newHeight = e.height

    const positionMaxTop = top + newHeight
    const positionMaxLeft = left + newWidth

    if (positionMaxTop > parentBounds?.height) newHeight = parentBounds?.height - top
    if (positionMaxLeft > parentBounds?.width) newWidth = parentBounds?.width - left

    updateMoveable(id, {
      top,
      left,
      width: newWidth,
      height: newHeight,
      color,
      parentBounds
    })

    // ACTUALIZAR NODO REFERENCIA
    const beforeTranslate = e.drag.beforeTranslate

    ref.current.style.width = `${e.width}px`
    ref.current.style.height = `${e.height}px`

    let translateX = beforeTranslate[0]
    let translateY = beforeTranslate[1]

    ref.current.style.transform = `translate(${translateX}px, ${translateY}px)`

    setNodoReferencia({
      ...nodoReferencia,
      translateX,
      translateY,
      top: top + translateY < 0 ? 0 : top + translateY,
      left: left + translateX < 0 ? 0 : left + translateX
    })
  }

  const onResizeEnd = async (e) => {
    let newWidth = e.lastEvent?.width
    let newHeight = e.lastEvent?.height

    const positionMaxTop = top + newHeight
    const positionMaxLeft = left + newWidth

    if (positionMaxTop > parentBounds?.height) newHeight = parentBounds?.height - top
    if (positionMaxLeft > parentBounds?.width) newWidth = parentBounds?.width - left

    const { lastEvent } = e
    const { drag } = lastEvent
    const { beforeTranslate } = drag

    const absoluteTop = top + beforeTranslate[2]
    const absoluteLeft = left + beforeTranslate[3]

    updateMoveable(
      id,
      {
        top: absoluteTop,
        left: absoluteLeft,
        width: newWidth,
        height: newHeight,
        color,
        parentBounds
      },
      true
    )
  }

  return (
    <>
      <div //renders component
        ref={ref}
        className='draggable'
        id={'component-' + id}
        style={{
          position: 'absolute',
          top: top,
          left: left,
          width: width,
          height: height,
          background: color
        }}
        onClick={() => setSelected(id)}
      />

      <Moveable //gives draggable and resize properties
        target={isSelected && ref.current}
        resizable
        draggable
        onDrag={(e) => {
          updateMoveable(id, {
            top: e.top,
            left: e.left,
            width,
            height,
            color,
            parentBounds
          })
        }}
        onResize={onResize}
        onResizeEnd={onResizeEnd}
        keepRatio={false}
        throttleResize={1}
        renderDirections={['nw', 'n', 'ne', 'w', 'e', 'sw', 's', 'se']}
        edge={true}
        zoom={1}
        origin={false}
        padding={{ left: 0, top: 0, right: 0, bottom: 0 }}
      />
    </>
  )
}
