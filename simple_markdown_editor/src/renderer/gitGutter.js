import { GutterMarker, gutter } from '@codemirror/view';
import { StateField, StateEffect, RangeSet } from '@codemirror/state';
import { diffLines } from 'diff';

// ── State Effect ──

const setGitMarkers = StateEffect.define();

// ── Gutter Markers ──

function makeMarkerEl(cls) {
  const el = document.createElement('div');
  el.className = cls;
  return el;
}

class AddedMarker extends GutterMarker {
  toDOM() { return makeMarkerEl('git-gutter-added'); }
}

class ModifiedMarker extends GutterMarker {
  toDOM() { return makeMarkerEl('git-gutter-modified'); }
}

class DeletedMarker extends GutterMarker {
  toDOM() { return makeMarkerEl('git-gutter-deleted'); }
}

const addedMarker = new AddedMarker();
const modifiedMarker = new ModifiedMarker();
const deletedMarker = new DeletedMarker();

// ── State Field ──

const gitGutterField = StateField.define({
  create() { return RangeSet.empty; },
  update(markers, tr) {
    for (const e of tr.effects) {
      if (e.is(setGitMarkers)) return e.value;
    }
    return markers.map(tr.changes);
  },
});

// ── Extension ──

const gitGutterExtension = [
  gitGutterField,
  gutter({
    class: 'cm-git-gutter',
    markers: (view) => view.state.field(gitGutterField),
  }),
];

// ── Diff Computation ──

function computeGitMarkers(doc, baseline, current) {
  const changes = diffLines(baseline, current);
  const markers = [];
  let lineNum = 1;
  let prevWasRemoved = false;

  for (const change of changes) {
    if (change.removed) {
      prevWasRemoved = true;
      continue;
    }

    const lineCount = change.count;

    if (change.added) {
      const marker = prevWasRemoved ? modifiedMarker : addedMarker;
      for (let i = 0; i < lineCount; i++) {
        const ln = lineNum + i;
        if (ln <= doc.lines) {
          markers.push(marker.range(doc.line(ln).from));
        }
      }
    } else if (prevWasRemoved) {
      // Lines were deleted here — place deleted marker on current line
      if (lineNum <= doc.lines) {
        markers.push(deletedMarker.range(doc.line(lineNum).from));
      }
    }

    if (!change.removed) {
      lineNum += lineCount;
    }
    prevWasRemoved = change.removed;
  }

  // Handle deletion at end of file
  if (prevWasRemoved && lineNum <= doc.lines) {
    markers.push(deletedMarker.range(doc.line(lineNum).from));
  }

  return RangeSet.of(markers, true);
}

export { gitGutterExtension, setGitMarkers, computeGitMarkers };
